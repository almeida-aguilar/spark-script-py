// Hub: el dispositivo Wedo (LEGO WeDo 2.0 Smart Hub) conectado desde el navegador.
//
//   const hub = new Hub();
//   hub.connect();                      // inicia la conexión y vuelve
//   await hub.waitConnection(10);       // espera a que esté conectado
//   hub.ports();                        // { a: "motor" }
//   hub.motor("A").run(50);
//
// Los selectores (`motor`, `distance`, `tilt`) solo validan el nombre del puerto: no
// necesitan conexión y el error (puerto vacío o de otro tipo) aparece al usar el recurso.
import * as K from "../core/constants.js";
import { ConnectionFailedError, NotConnectedError } from "../core/errors.js";
import { Button } from "./button.js";
import { LED } from "./led.js";
import { Motor } from "./motor.js";
import { DistanceSensor, TiltSensor } from "./sensors.js";
import { Session } from "./session.js";
import { TaskManager, TaskProtocol } from "./tasks.js";

const PORTS = { A: K.CONN_PORT_A, B: K.CONN_PORT_B };

/** Valida el nombre del puerto (sin exigir conexión) y devuelve su conexión interna. */
function portConn(port) {
  if (typeof port !== "string") throw new TypeError(`hub: el puerto esperaba una cadena y recibió ${typeof port}`);
  const conn = PORTS[port.toUpperCase()];
  if (conn === undefined) throw new RangeError(`puerto "${port}" no válido (puertos válidos: a, b)`);
  return conn;
}

/** Nombre canónico del puerto, en minúsculas ("a", "b"). */
function portLabel(port) {
  return portConn(port) === K.CONN_PORT_A ? "a" : "b";
}

function checkTimeout(timeout) {
  if (timeout === null || timeout === undefined) return null;
  if (typeof timeout !== "number") throw new TypeError(`timeout must be a number, not ${typeof timeout}`);
  if (!Number.isFinite(timeout) || timeout < 0) {
    throw new RangeError(`timeout must be a finite number >= 0, got ${timeout}`);
  }
  return timeout;
}

export class Hub {
  /** `transport` y `timing` sirven para pruebas y ajustes; en uso normal se omiten. */
  constructor({ transport = null, timing = null } = {}) {
    this._session = new Session(transport, timing);
    this._led = new LED(this._session);
    this._button = new Button(this._session);
    this._taskManager = new TaskManager();
    this._task = new TaskProtocol(this._taskManager);
    this._connectError = null;
    this._connecting = null;
  }

  // -- ciclo de vida ----------------------------------------------------------------

  /** Inicia la conexión y regresa de inmediato; el resultado se consulta con `waitConnection`. */
  connect() {
    // Si ya está conectado o hay un intento en curso, no hace nada.
    if (this.isConnected || this._connecting) return this;
    const core = this._session.ensureCore();
    this._connectError = null;
    this._connecting = core.connect().then(
      () => { this._connecting = null; },
      (exc) => { this._connectError = exc; this._connecting = null; },
    );
    return this;
  }

  /**
   * Espera hasta que el hub esté conectado. Devuelve `true` si se conectó, `false` si se
   * agotó el tiempo. Si el intento falló, lanza `ConnectionFailedError`.
   */
  async waitConnection(timeout = null) {
    const limit = checkTimeout(timeout);
    const deadline = limit === null ? Infinity : Date.now() + limit * 1000;
    for (;;) {
      if (this.isConnected) return true;
      if (this._connectError) {
        const err = this._connectError;
        this._connectError = null;
        throw new ConnectionFailedError(err?.message ?? "no se pudo conectar con el hub");
      }
      if (Date.now() >= deadline) return false;
      await new Promise((r) => setTimeout(r, 40));
    }
  }

  get isConnected() { return this._session.isConnected; }

  /** Estado del hub: disconnected, connecting, connected, disconnecting, shutdown, error. */
  get state() { return this._session._core ? this._session._core.state : "disconnected"; }

  /** Cierra la conexión (parando antes los motores). Seguro de llamar dos veces. */
  disconnect() { return this._session.disconnect(); }

  /** Pide al hub que se apague; hay que encenderlo a mano después. */
  shutdown() { return this._session.shutdown(); }

  /** Pide parar todos los motores (perfil `nobarrier`: sin garantía de orden). */
  stopAll() { return this._session.stopAll(); }

  /** Nivel de batería en porcentaje. */
  readBattery() { return this._session.core.readBattery(); }

  /** Suscripción a eventos del núcleo (`state`, `ports`, `motor`, `button`, `sample`, `log`). */
  subscribe(fn) { return this._session.ensureCore().subscribe(fn); }

  // -- puertos y periféricos ------------------------------------------------------------

  /** Instantánea de los puertos: `{ "a": "motor", "b": "distance" }` (nombres en minúsculas). */
  ports() {
    this._session.requireUsable();
    const raw = this._session.portsRaw();
    const out = {};
    for (const [name, conn] of Object.entries(PORTS)) {
      if (raw.has(conn)) out[name.toLowerCase()] = K.TYPE_NAMES[raw.get(conn)] ?? "unknown";
    }
    return out;
  }

  /** Pide al hub que informe de nuevo sus dispositivos y devuelve la nueva instantánea. */
  async refreshPorts() {
    await this._session.refreshPorts();
    return this.ports();
  }

  /** Un motor en el puerto indicado. No exige conexión: el error aparece al usarlo. */
  motor(port) {
    return new Motor(this._session, portConn(port), portLabel(port));
  }

  /** Un sensor de distancia en el puerto indicado. */
  distance(port) {
    return new DistanceSensor(this._session, portConn(port), portLabel(port));
  }

  /** Un sensor de inclinación en el puerto indicado. */
  tilt(port) {
    return new TiltSensor(this._session, portConn(port), portLabel(port));
  }

  get led() { return this._led; }
  get button() { return this._button; }

  /** Concurrencia cooperativa: `spawn(fn)`, `wait(s)`, tareas con `join`/`cancel`. */
  get task() { return this._task; }
}

export { NotConnectedError };
