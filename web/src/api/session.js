// Ciclo de vida de una sesión de hub: coordinador, seguimientos de cambios y registro de cierre.
import { Coordinator } from "../core/coordinator.js";
import { HubState } from "../core/state-machine.js";
import { InvalidStateError, NotConnectedError, PortError } from "../core/errors.js";
import { WebBluetoothTransport } from "../transport/web-bluetooth.js";
import { ResourceChanges } from "./change-tracker.js";
import * as K from "../core/constants.js";

// Equivalente al Supervisor de Python (atexit): al cerrar/ocultar la página se intenta,
// como mejor esfuerzo, parar los motores. Un navegador puede no dejar completar la escritura.
const sessions = new Set();
let hooked = false;
function hookPageLifecycle() {
  if (hooked || typeof globalThis.addEventListener !== "function") return;
  hooked = true;
  globalThis.addEventListener("pagehide", () => {
    for (const s of sessions) s.emergencyClose().catch(() => {});
  });
}

/** Cambios pendientes de una conexión (o del botón integrado). */
export class Session {
  constructor(transport = null, timing = null) {
    this._transport = transport;
    this._timing = timing;
    this._core = null;
    this._changes = new Map(); // clave (conn o "button") -> ResourceChanges
    this._unsub = null;
  }

  /** El coordinador. Lanza si el hub nunca se conectó. */
  get core() {
    if (!this._core) throw new InvalidStateError("hub is not connected; call connect() first");
    return this._core;
  }

  get isConnected() {
    return this._core !== null && this._core.state === HubState.CONNECTED;
  }

  /** Crea el coordinador si hace falta (permite suscribirse a eventos antes de conectar). */
  ensureCore() {
    if (!this._core) {
      this._core = new Coordinator(this._transport ?? new WebBluetoothTransport(), this._timing);
      this._unsub?.();
      this._unsub = this._core.subscribe((type, d) => this._onCore(type, d));
    }
    return this._core;
  }

  // -- estado y recursos ---------------------------------------------------------------

  /** El hub debe estar conectado: si no, `NotConnectedError`. */
  requireUsable() {
    if (!this.isConnected) throw new NotConnectedError("hub no conectado");
  }

  /** El puerto debe tener el periférico esperado: si no, `PortError`. */
  requireDevice(conn, typeCode) {
    this.requireUsable();
    const raw = this.portsRaw();
    const found = raw.get(conn);
    const port = conn === K.CONN_PORT_A ? "a" : "b";
    const expected = K.TYPE_NAMES[typeCode] ?? "unknown";
    if (found === undefined) {
      throw new PortError(`puerto "${port}": no hay ningún periférico conectado (se esperaba "${expected}")`);
    }
    if (found !== typeCode) {
      throw new PortError(`puerto "${port}": hay un periférico "${K.TYPE_NAMES[found] ?? "unknown"}" y se esperaba "${expected}"`);
    }
  }

  /** Seguimientos de cambios de una conexión (o del botón). */
  changes(key) {
    let c = this._changes.get(key);
    if (!c) { c = new ResourceChanges(); this._changes.set(key, c); }
    return c;
  }

  /** Descarta todos los cambios pendientes (al conectar o desconectar). */
  resetChanges() {
    for (const c of this._changes.values()) c.reset();
  }

  // -- ciclo de vida -------------------------------------------------------------------

  async connect() {
    await this.ensureCore().connect();
    this.resetChanges();
    sessions.add(this);
    hookPageLifecycle();
  }

  /** Desconecta: para los motores y cierra el enlace. */
  async disconnect() {
    let confirmed = true;
    if (this._core) confirmed = await this._core.disconnect();
    this.resetChanges();
    sessions.delete(this);
    return confirmed;
  }

  async shutdown() {
    const core = this.core;
    try { await core.stopAll(); } catch (exc) {
      core._log("warn", `could not stop motors before shutdown: ${exc?.message}`);
    }
    await core.shutdownHub();
    sessions.delete(this);
  }

  stopAll() { return this.core.stopAll(); }
  portsRaw() { return this._core ? this._core.portsRaw() : new Map(); }
  refreshPorts() { return this.core.refreshPorts(); }

  /** Cierre de emergencia (pagehide). Mejor esfuerzo, nunca lanza. */
  async emergencyClose() {
    try {
      if (this._core) await this._core.disconnect();
    } catch { /* nunca propaga */ }
  }

  // -- eventos del núcleo --------------------------------------------------------------

  _onCore(type, d) {
    if (type === "sample") this._onSample(d);
    else if (type === "button") this._onButton(d);
    else if (type === "state" || type === "ports") this.resetChanges();
  }

  _onSample({ conn, value, mode }) {
    const type = this.portsRaw().get(conn);
    if (type === K.TYPE_MOTION) {
      const scalar = this._asNumber(value);
      this.changes(conn).distance.observe(scalar, (prev, next) => (
        next > prev ? "increase" : next < prev ? "decrease" : null
      ));
    } else if (type === K.TYPE_TILT) {
      if (mode === K.TILT_ANGLE) {
        const [x, y] = this._asPair(value);
        const changes = this.changes(conn);
        changes.axis(0).observe(x, (prev, next) => (next > prev ? "increase" : next < prev ? "decrease" : null));
        changes.axis(1).observe(y, (prev, next) => (next > prev ? "increase" : next < prev ? "decrease" : null));
      } else {
        const direction = this._asDirection(value);
        this.changes(conn).tilt.observe(direction, (prev, next) => (next === prev ? null : next));
      }
    }
  }

  _onButton({ pressed }) {
    this.changes("button").button.observe(Boolean(pressed), (prev, next) => (next ? "pressed" : "released"));
  }

  _asNumber(value) {
    if (value instanceof Float32Array) return value[0];
    if (value instanceof Uint8Array) {
      const view = new DataView(value.buffer, value.byteOffset, value.byteLength);
      return view.getFloat32(0, true);
    }
    return Number(value);
  }

  _asPair(value) {
    if (value instanceof Uint8Array && value.length >= 2) {
      return [value[0] > 127 ? value[0] - 256 : value[0], value[1] > 127 ? value[1] - 256 : value[1]];
    }
    return [0, 0];
  }

  _asDirection(value) {
    const codes = { 0: "none", 3: "backward", 5: "right", 7: "left", 9: "forward" };
    const n = this._asNumber(value);
    return codes[n] ?? "none";
  }
}
