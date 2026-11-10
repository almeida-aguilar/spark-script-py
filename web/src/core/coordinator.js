// Coordinador de un solo escritor (single-writer) sobre el transporte BLE.
// Port de la clase Coordinator de wedopy_core/_wedopy.pyx.
//
//  * toda llamada al transporte pasa por una única cola serializada;
//  * las peticiones `emergency` (watchdog, paradas) se ejecutan antes que las normales;
//  * gana la última orden válida de motor; no hay "leases";
//  * perfil de parada `nobarrier`: no se garantiza que órdenes normales no se intercalen
//    entre las peticiones de parada de `stopAll()`.
//
// JavaScript es monohilo: el "hilo escritor" de Python es aquí un bucle asíncrono que
// procesa la cola. Los callbacks del transporte solo actualizan estado y despiertan a
// los que esperan; nunca ejecutan código de usuario.
import * as K from "./constants.js";
import {
  BLEError, DeviceNotFoundError, DeviceTypeError, HubBusyError, HubConnectionError,
  HubDisconnectedError, InvalidStateError, OperationTimeout, WedoError,
} from "./errors.js";
import {
  inputFormat, inputStart, ledIndex, ledRgb, motorPower, parsePortEvent, parseSample,
} from "./protocol.js";
import { HubState, StateMachine } from "./state-machine.js";
import { makeTiming } from "./timing.js";
import { Emitter, Signal, hexString, now, withTimeout } from "./util.js";
import { Watchdog } from "./watchdog.js";

const keyOf = (typ, mode) => `${typ}/${mode}`;

// Cuántas veces puede un lector re-afirmar su formato antes de rendirse: sin tope, dos
// lectores que reclaman formatos distintos se roban el sensor en bucle.
const MAX_REASSERTS = 3;

export class Coordinator extends Emitter {
  static STOP_PROFILE = "nobarrier";

  constructor(transport, timing) {
    super();
    this._t = transport;
    this.timing = timing ? makeTiming(timing) : makeTiming();
    this._sm = new StateMachine((state, error) => this.emit("state", { state, error }));
    this._linkLost = false;
    this._lossHandled = false;
    this._tripping = false;
    this._ports = new Map(); // conn -> {conn, attached, hubIndex, type}
    this._modes = new Map(); // conn -> "type/mode" configurado
    this._samples = new Map(); // conn -> último valor (Uint8Array)
    this._ledMode = -1;
    this._button = false;
    this._speeds = new Map(); // conn -> última velocidad ordenada
    this._lastOk = 0;
    this._lastPortChange = 0;
    this._changed = new Signal();
    // cola
    this._emergencyQ = [];
    this._normalQ = [];
    this._workerActive = false;
    this._draining = null; // promesa del bucle de drenaje en curso
    this._isDraining = false;
    this._epoch = 0; // se incrementa al abrir/cerrar el worker: descarta órdenes antiguas
    this._wd = null;
  }

  // -- estado -----------------------------------------------------------------

  get state() { return this._sm.state; }
  get error() { return this._sm.error; }

  /** Excepción que describe por qué el hub no admite operaciones ahora, o null. */
  _unusable() {
    const st = this._sm.state;
    switch (st) {
      case HubState.CONNECTED: return null;
      case HubState.CONNECTING:
      case HubState.DISCONNECTING: return new HubBusyError(`hub is ${st}`);
      case HubState.ERROR: return new HubDisconnectedError(`hub connection lost: ${this._sm.error}`);
      case HubState.SHUTDOWN:
        return new InvalidStateError("hub was shut down; power it on and call connect()");
      default: return new InvalidStateError("hub is not connected; call connect() first");
    }
  }

  checkUsable() {
    const exc = this._unusable();
    if (exc) throw exc;
  }

  _log(level, message) {
    this.emit("log", { level, message });
  }

  // -- cola / worker ------------------------------------------------------------

  _startWorker() {
    this._emergencyQ.length = 0;
    this._normalQ.length = 0;
    this._epoch += 1;
    this._workerActive = true;
  }

  async _stopWorker() {
    this._workerActive = false;
    this._epoch += 1;
    const pending = [...this._emergencyQ, ...this._normalQ];
    this._emergencyQ.length = 0;
    this._normalQ.length = 0;
    for (const req of pending) req.reject(new HubDisconnectedError("hub closed"));
    const inflight = this._isDraining ? this._draining : null;
    if (inflight) {
      // espera la operación en vuelo (acotada); un transporte colgado no bloquea el cierre
      await withTimeout(inflight, this.timing.opTimeout * 2 + 1.0, () => null).catch(() => {});
    }
  }

  _enqueue(fn, { emergency = false, needsConnected = true } = {}) {
    if (!this._workerActive) {
      throw new InvalidStateError("hub is not connected; call connect() first");
    }
    const req = { fn, emergency, needsConnected, epoch: this._epoch, abandoned: false, settled: false };
    req.promise = new Promise((resolve, reject) => {
      req.resolve = (v) => { req.settled = true; resolve(v); };
      req.reject = (e) => { req.settled = true; reject(e); };
    });
    req.promise.catch(() => {}); // evita "unhandled rejection" en peticiones abandonadas
    (emergency ? this._emergencyQ : this._normalQ).push(req);
    this._kick();
    return req;
  }

  _kick() {
    // `_isDraining` se libera de forma síncrona al vaciarse la cola (ver `finally` de
    // `_drain`): si se liberase en un microtask posterior, una petición encolada justo
    // entre tanto quedaría sin atender.
    if (this._isDraining) return;
    this._isDraining = true;
    this._draining = this._drain();
  }

  async _drain() {
    try {
      while (this._workerActive) {
        const req = this._emergencyQ.length ? this._emergencyQ.shift() : this._normalQ.shift();
        if (!req) break;
        if (req.abandoned) { req.resolve(undefined); continue; }
        if (req.epoch !== this._epoch) {
          req.reject(new HubDisconnectedError("stale request dropped after reconnect"));
          continue;
        }
        try {
          if (req.needsConnected) this.checkUsable();
          const result = await req.fn();
          this._lastOk = now();
          req.resolve(result);
        } catch (exc) {
          req.reject(exc);
        }
      }
    } finally {
      this._isDraining = false;
    }
  }

  _submit(fn, emergency, needsConnected, timeout, outer) {
    const req = this._enqueue(fn, { emergency, needsConnected });
    // peor caso: una operación en vuelo (<= opTimeout) más esta (<= timeout)
    const limit = outer ?? timeout + this.timing.opTimeout + 0.5;
    if (!Number.isFinite(limit)) return req.promise;
    return withTimeout(req.promise, limit, () => {
      req.abandoned = true;
      return new OperationTimeout("hub operation did not complete");
    });
  }

  async _io(op, args, timeout) {
    try {
      return await this._t[op](...args, timeout);
    } catch (exc) {
      if (exc instanceof HubDisconnectedError) {
        this._onLinkLost(exc.message);
        throw exc;
      }
      if (exc instanceof WedoError) throw exc;
      throw new BLEError(exc?.message ?? String(exc), { cause: exc });
    }
  }

  _call(op, args = [], { timeout, emergency = false, needsConnected = true, outer } = {}) {
    const t = timeout ?? this.timing.opTimeout;
    return this._submit(() => this._io(op, args, t), emergency, needsConnected, t, outer);
  }

  // -- notificaciones (callbacks del transporte) ------------------------------------

  _onNotify(uuid, data) {
    try {
      if (uuid === K.CHAR_PORT) {
        this._handlePort(data);
      } else if (uuid === K.CHAR_SENSOR) {
        const s = parseSample(data);
        this._samples.set(s.conn, s.value);
        this.emit("sample", { conn: s.conn, value: s.value });
        this._changed.notify();
      } else if (uuid === K.CHAR_BUTTON) {
        if (data.length > 0) {
          this._button = data[0] !== 0;
          this.emit("button", { pressed: this._button });
        }
      } else if (uuid === K.CHAR_DISCONNECT) {
        this._onLinkLost("hub sent a Disconnect notification");
      }
    } catch (exc) {
      this._log("debug", `bad notification on ${uuid}: ${hexString(data)} (${exc?.message})`);
    }
  }

  _handlePort(data) {
    const ev = parsePortEvent(data);
    const old = this._ports.get(ev.conn);
    if (ev.attached) {
      // repetición idéntica: no es actividad y conserva el modo configurado
      if (old && old.type === ev.type && old.hubIndex === ev.hubIndex) return;
      this._ports.set(ev.conn, ev);
    } else {
      if (!old) return;
      this._ports.delete(ev.conn);
    }
    this._modes.delete(ev.conn); // un dispositivo nuevo/retirado empieza en su modo por defecto
    this._samples.delete(ev.conn);
    if (ev.conn === K.CONN_RGB) this._ledMode = -1;
    this._lastPortChange = now();
    this.emit("ports", { ports: this.portsRaw() });
    this._changed.notify();
  }

  _onLinkLost(reason) {
    const st = this._sm.state;
    if (st === HubState.DISCONNECTING || st === HubState.DISCONNECTED || st === HubState.SHUTDOWN) return;
    this._linkLost = true;
    this._sm.forceError(reason);
    this._changed.notify();
    const handle = !this._lossHandled;
    this._lossHandled = true;
    if (handle) this._log("error", `link lost: ${reason}`);
    if (handle && this._motorsActive()) {
      // parada de mejor esfuerzo, fuera del callback del transporte
      this._trip(`link lost: ${reason}`).catch(() => {});
    }
  }

  // -- conexión ---------------------------------------------------------------------

  async connect() {
    const st = this._sm.state;
    if (st === HubState.CONNECTED) return;
    if (st === HubState.CONNECTING || st === HubState.DISCONNECTING) {
      throw new HubBusyError(`hub is ${st}`);
    }
    this._sm.transition(HubState.CONNECTING);
    this._ports.clear(); this._modes.clear(); this._samples.clear(); this._speeds.clear();
    this._ledMode = -1;
    this._button = false;
    this._linkLost = false;
    this._lossHandled = false;
    this._tripping = false;
    const tm = this.timing;
    try {
      this._startWorker();
      this._t.setCallbacks((u, d) => this._onNotify(u, d), (r) => this._onLinkLost(r));
      // Con transportes interactivos (selector del navegador) no se limita el tiempo total:
      // el límite `connectTimeout` lo aplica el transporte a la conexión GATT y al descubrimiento.
      await this._call("connect", [], {
        timeout: tm.connectTimeout, needsConnected: false,
        outer: this._t.interactive ? Infinity : undefined,
      });
      for (const char of K.REQUIRED_CHARS) {
        if (!this._t.hasCharacteristic(char)) {
          throw new HubConnectionError(`device does not look like a WeDo 2.0 hub: missing ${char}`);
        }
      }
      // La notificación Disconnect es opcional: algunos hubs no la soportan.
      await this._optional("subscribe", K.CHAR_DISCONNECT);
      await this._call("subscribe", [K.CHAR_SENSOR], { needsConnected: false });
      if (this._t.hasCharacteristic(K.CHAR_BUTTON)) {
        await this._optional("subscribe", K.CHAR_BUTTON);
        try {
          const data = await this._call("read", [K.CHAR_BUTTON], { needsConnected: false });
          this._button = data.length > 0 && data[0] !== 0;
        } catch (exc) {
          if (!(exc instanceof WedoError)) throw exc;
        }
      }
      await this._call("subscribe", [K.CHAR_PORT], { needsConnected: false });
      await this._settlePorts(HubState.CONNECTING);
      if (this._sm.state !== HubState.CONNECTING) {
        throw this._unusable() ?? new HubDisconnectedError("connection lost during connect");
      }
      this._lastOk = now();
      this._sm.transition(HubState.CONNECTED);
      this._startWatchdog();
    } catch (exc) {
      await this._abortConnect(exc);
      if (exc instanceof WedoError) throw exc;
      throw new HubConnectionError(exc?.message ?? String(exc), { cause: exc });
    }
  }

  async _optional(op, ...args) {
    try {
      await this._call(op, args, { needsConnected: false });
    } catch (exc) {
      if (!(exc instanceof WedoError)) throw exc;
      this._log("debug", `optional ${op} ${args} unavailable: ${exc.message}`);
    }
  }

  async _abortConnect(exc) {
    if (this._sm.state === HubState.CONNECTING) {
      this._sm.transition(HubState.ERROR, exc?.message ?? String(exc));
      this._changed.notify();
    }
    await this._stopWatchdog();
    await this._stopWorker();
    try { await this._t.disconnect(); } catch { /* mejor esfuerzo */ }
  }

  /** Espera a que dejen de llegar eventos de puerto: 1,5 s de calma, 5 s como máximo. */
  async _settlePorts(expected) {
    const tm = this.timing;
    const start = now();
    this._lastPortChange = Math.max(this._lastPortChange, start);
    for (;;) {
      if (this._sm.state !== expected) {
        throw this._unusable() ?? new HubDisconnectedError("connection lost during port discovery");
      }
      const t = now();
      const quietLeft = tm.settleQuiet - (t - this._lastPortChange);
      const maxLeft = tm.settleMax - (t - start);
      if (quietLeft <= 0 || maxLeft <= 0) return;
      await this._changed.wait(Math.min(quietLeft, maxLeft));
    }
  }

  /**
   * Para motores (mejor esfuerzo), cierra BLE y libera recursos.
   * Devuelve true si no hacía falta parar motores o todas las paradas tuvieron ACK.
   */
  async disconnect() {
    const st = this._sm.state;
    if (st === HubState.DISCONNECTED || st === HubState.SHUTDOWN) {
      if (st === HubState.SHUTDOWN) this._sm.transition(HubState.DISCONNECTED);
      return true;
    }
    if (st === HubState.CONNECTING || st === HubState.DISCONNECTING) {
      throw new HubBusyError(`hub is ${st}`);
    }
    const linkLost = this._linkLost;
    this._sm.transition(HubState.DISCONNECTING);
    let confirmed = true;
    if (!linkLost) {
      ({ confirmed } = await this._stopMotors(this.timing.emergencyAttempts, this.timing.emergencyAttemptTimeout));
    } else if (this._motorsActive()) {
      confirmed = false;
    }
    await this._stopWatchdog();
    await this._stopWorker();
    try { await this._t.disconnect(); } catch (exc) { this._log("debug", `transport disconnect failed: ${exc?.message}`); }
    if (confirmed) this._speeds.clear();
    this._sm.transition(HubState.DISCONNECTED);
    this._changed.notify();
    if (!confirmed) this._log("warn", "disconnect: motor stop could not be confirmed");
    return confirmed;
  }

  /** Pide al hub que se apague. Se declara apagado solo tras un ACK. */
  async shutdownHub() {
    this.checkUsable();
    await this._call("write", [K.CHAR_TURN_OFF, Uint8Array.of(1)]);
    this._sm.transition(HubState.SHUTDOWN);
    await this._stopWatchdog();
    await this._stopWorker();
    try { await this._t.disconnect(); } catch { /* mejor esfuerzo */ }
  }

  // -- puertos ----------------------------------------------------------------------

  /** Copia de los dispositivos conocidos: `Map` conn -> tipo (incluye los internos). */
  portsRaw() {
    return new Map([...this._ports].map(([c, ev]) => [c, ev.type]));
  }

  async refreshPorts() {
    this.checkUsable();
    this._ports.clear(); this._modes.clear(); this._samples.clear();
    this._ledMode = -1;
    this._lastPortChange = now();
    await this._call("unsubscribe", [K.CHAR_PORT]);
    await this._call("subscribe", [K.CHAR_PORT]);
    await this._settlePorts(HubState.CONNECTED);
  }

  _requireDevice(conn, typ) {
    const ev = this._ports.get(conn);
    if (!ev) throw new DeviceNotFoundError(`no device on connect id ${conn}`);
    if (ev.type !== typ) {
      const name = (t) => K.TYPE_NAMES[t] ?? `0x${t.toString(16).padStart(2, "0")}`;
      throw new DeviceTypeError(`device on connect id ${conn} is a ${name(ev.type)}, expected a ${name(typ)}`);
    }
  }

  // -- salidas ----------------------------------------------------------------------

  _motorsActive() {
    for (const s of this._speeds.values()) if (s !== 0) return true;
    return false;
  }

  async setMotor(conn, speed) {
    this.checkUsable();
    this._requireDevice(conn, K.TYPE_MOTOR);
    const data = motorPower(conn, speed);
    const wasActive = this._motorsActive();
    if (speed !== 0) {
      this._speeds.set(conn, speed);
      if (!wasActive) this._lastOk = now();
      this._wd?.wake();
    }
    await this._call("write", [K.CHAR_OUTPUT_CMD, data]);
    if (speed === 0) this._speeds.set(conn, 0);
    this.emit("motor", { conn, speed });
  }

  /** Para todos los motores conocidos; lanza el primer error tras intentarlos todos. */
  async stopAll() {
    this.checkUsable();
    const conns = this._knownMotors();
    let first = null;
    for (const conn of conns) {
      try {
        await this._call("write", [K.CHAR_OUTPUT_CMD, motorPower(conn, 0)], { emergency: true });
      } catch (exc) {
        first ??= exc;
        continue;
      }
      this._speeds.set(conn, 0);
      this.emit("motor", { conn, speed: 0 });
    }
    if (first) throw first;
  }

  _knownMotors() {
    const set = new Set();
    for (const [c, ev] of this._ports) if (ev.type === K.TYPE_MOTOR) set.add(c);
    for (const c of this._speeds.keys()) set.add(c);
    return [...set].sort((a, b) => a - b);
  }

  async _ensureLedMode(mode) {
    if (this._ledMode === mode) return;
    await this._call("write", [
      K.CHAR_INPUT_CMD, inputFormat(K.CONN_RGB, K.TYPE_RGB, mode, 1, K.UNIT_RAW, true),
    ]);
    this._ledMode = mode;
  }

  async ledIndex(index) {
    this.checkUsable();
    await this._ensureLedMode(K.LED_DISCRETE);
    await this._call("write", [K.CHAR_OUTPUT_CMD, ledIndex(index)]);
  }

  async ledRgb(r, g, b) {
    this.checkUsable();
    await this._ensureLedMode(K.LED_ABSOLUTE);
    await this._call("write", [K.CHAR_OUTPUT_CMD, ledRgb(r, g, b)]);
  }

  // -- entradas ---------------------------------------------------------------------

  buttonPressed() {
    this.checkUsable();
    return this._button;
  }

  /** Nivel de batería (%), la misma lectura que usa el heartbeat. */
  async readBattery() {
    this.checkUsable();
    const data = await this._call("read", [K.CHAR_BATTERY]);
    return data[0];
  }

  /**
   * Configura el sensor una vez y devuelve el último valor recibido. El hub solo notifica
   * cuando el valor cambia, así que un valor sin cambios sigue siendo válido mientras el
   * enlace esté activo.
   *
   * Varios lectores pueden compartir la misma conexión (por ejemplo, el panel sondea el
   * inclinómetro mientras un programa lee su ángulo). Si otro lector reconfigura la
   * conexión con otro formato, aquí se re-afirma el propio en vez de fallar: el
   * dispositivo no ha cambiado, solo el formato solicitado.
   */
  async readSensor(conn, typ, mode, unit, expectedLen = null, timeout = null) {
    this.checkUsable();
    this._requireDevice(conn, typ);
    const wait = timeout ?? this.timing.sensorTimeout;
    const key = keyOf(typ, mode);
    const configure = async () => {
      this._samples.delete(conn);
      this._modes.set(conn, key);
      try {
        await this._call("write", [K.CHAR_INPUT_CMD, inputFormat(conn, typ, mode, 1, unit, true)]);
        await this._call("write", [K.CHAR_INPUT_CMD, inputStart(conn)]);
      } catch (exc) {
        if (this._modes.get(conn) === key) this._modes.delete(conn);
        throw exc;
      }
    };
    if (this._modes.get(conn) !== key) await configure();
    const deadline = now() + wait;
    let reasserts = 0;
    for (;;) {
      const exc = this._unusable();
      if (exc) throw exc;
      if (!this._ports.has(conn)) throw new DeviceNotFoundError(`the device on connect id ${conn} was disconnected`);
      if (this._modes.get(conn) !== key && reasserts < MAX_REASSERTS) {
        // Otro lector reconfiguró esta conexión con otro formato (p. ej. el panel pide la
        // dirección mientras un programa lee el ángulo). Re-afirmamos el nuestro, pero solo
        // unas pocas veces: dos lectores que se re-afirman sin fin se ROBan el sensor en
        // bucle y ninguno recibe su valor.
        reasserts++;
        await configure();
        if (now() >= deadline) throw new OperationTimeout(`the hub sent no value within ${wait.toFixed(1)} s`);
        continue;
      }
      const value = this._samples.get(conn);
      if (value && (expectedLen === null || value.length === expectedLen)) return value;
      const remaining = deadline - now();
      if (remaining <= 0) throw new OperationTimeout(`the hub sent no value within ${wait.toFixed(1)} s`);
      await this._changed.wait(remaining);
    }
  }

  // -- watchdog ---------------------------------------------------------------------

  _startWatchdog() {
    this._wd = new Watchdog({
      timing: this.timing,
      isArmed: () => this._sm.state === HubState.CONNECTED && this._motorsActive(),
      enqueueHeartbeat: () => this._enqueue(
        () => this._io("read", [K.CHAR_BATTERY], this.timing.opTimeout),
        { emergency: true, needsConnected: false },
      ),
      lastOk: () => this._lastOk,
      trip: (reason) => this._trip(reason),
    });
    this._wd.start();
  }

  async _stopWatchdog() {
    const wd = this._wd;
    this._wd = null;
    if (wd) await wd.stop();
  }

  /**
   * Escribe velocidad 0 a todos los motores conocidos con prioridad de emergencia.
   * Devuelve `{confirmed, results}`.
   */
  async _stopMotors(attempts, attemptTimeout) {
    let pending = this._knownMotors();
    const results = [];
    for (let i = 0; i < attempts; i += 1) {
      if (pending.length === 0) break;
      const still = [];
      for (const conn of pending) {
        try {
          await this._call("write", [K.CHAR_OUTPUT_CMD, motorPower(conn, 0)], {
            timeout: attemptTimeout, emergency: true, needsConnected: false,
          });
        } catch {
          still.push(conn);
          continue;
        }
        this._speeds.set(conn, 0);
        this.emit("motor", { conn, speed: 0 });
      }
      pending = still;
      results.push(pending.length === 0);
    }
    return { confirmed: pending.length === 0, results };
  }

  /** Parada de emergencia: intentos priorizados, registro y después estado `error`. */
  async _trip(reason) {
    if (this._tripping) return;
    this._tripping = true;
    try {
      const tm = this.timing;
      this._log("error", `watchdog: ${reason}`);
      const { confirmed, results } = await this._stopMotors(tm.emergencyAttempts, tm.emergencyAttemptTimeout);
      const parts = [];
      for (let i = 0; i < results.length; i += 1) {
        parts.push(`${i === 0 ? "stop attempt 1" : `attempt ${i + 1}`}${results[i] ? " ACK" : " no ACK"}`);
        if (results[i]) break;
      }
      if (confirmed) {
        this._log("warn", `watchdog: ${parts.join(", ")}`);
        this._log("warn", "watchdog: motors stopped");
      } else {
        this._log("error", `watchdog: stop NOT confirmed (${tm.emergencyAttempts} attempts)`);
      }
      this._sm.forceError(reason);
      this._changed.notify();
    } finally {
      this._tripping = false;
    }
  }
}
