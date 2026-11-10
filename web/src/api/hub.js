// Hub: el LEGO WeDo 2.0 Smart Hub físico (equivalente a src/wedopy/hub.py).
//
//   const hub = new Hub();            // Web Bluetooth (requiere un clic del usuario)
//   await hub.connect();
//   await hub.motor("A").run(50);
//   await hub.disconnect();
//
// o, con cierre garantizado:
//
//   await Hub.use(async (hub) => { await hub.motor("A").run(100); });
import * as K from "../core/constants.js";
import { AmbiguousDeviceError, DeviceNotFoundError, DeviceTypeError } from "../core/errors.js";
import { Button } from "./button.js";
import { LED } from "./led.js";
import { Motor, MotorGroup } from "./motor.js";
import { DistanceSensor, TiltSensor } from "./sensors.js";
import { Session } from "./session.js";

const PORTS = { A: K.CONN_PORT_A, B: K.CONN_PORT_B };
const CONN_PORT = { [K.CONN_PORT_A]: "A", [K.CONN_PORT_B]: "B" };

function portConn(port) {
  if (typeof port !== "string") throw new TypeError(`port must be 'A' or 'B', not ${typeof port}`);
  const conn = PORTS[port.toUpperCase()];
  if (conn === undefined) throw new RangeError(`port must be 'A' or 'B', got '${port}'`);
  return conn;
}

export class Hub {
  /** `transport` y `timing` sirven para pruebas y ajustes; en uso normal se omiten. */
  constructor({ transport = null, timing = null } = {}) {
    this._session = new Session(transport, timing);
    this._led = new LED(this._session);
    this._button = new Button(this._session);
  }

  /** Crea un hub, lo conecta, ejecuta `fn(hub)` y lo desconecta siempre (context manager). */
  static async use(fn, options = {}) {
    const hub = new Hub(options);
    await hub.connect();
    let failed = true;
    try {
      const result = await fn(hub);
      failed = false;
      return result;
    } finally {
      try { await hub.disconnect(); } catch (exc) { if (!failed) throw exc; }
    }
  }

  // -- ciclo de vida ------------------------------------------------------------

  /** Conecta con el primer WeDo 2.0 elegido por el usuario. Devuelve `this`. */
  async connect() {
    await this._session.connect();
    return this;
  }

  get isConnected() { return this._session.isConnected; }

  /** Estado del hub: disconnected, connecting, connected, disconnecting, shutdown, error. */
  get state() { return this._session._core ? this._session._core.state : "disconnected"; }

  /** Cancela tareas, intenta parar los motores y cierra BLE. Seguro de llamar dos veces. */
  disconnect() { return this._session.disconnect(); }

  /** Pide al hub que se apague; hay que encenderlo a mano después. */
  shutdown() { return this._session.shutdown(); }

  /** Pide parar todos los motores (perfil `nobarrier`: sin garantía de orden frente a otras órdenes). */
  stopAll() { return this._session.stopAll(); }

  /** Nivel de batería en porcentaje. */
  readBattery() { return this._session.core.readBattery(); }

  /** Suscripción a eventos del núcleo (`state`, `ports`, `motor`, `button`, `sample`, `log`). */
  subscribe(fn) { return this._session.ensureCore().subscribe(fn); }

  // -- puertos y dispositivos ---------------------------------------------------------

  /** Instantánea de los dispositivos externos, p. ej. `{ A: "motor", B: "distance" }`. */
  get ports() {
    const raw = this._session.portsRaw();
    const out = {};
    for (const [name, conn] of Object.entries(PORTS)) {
      if (raw.has(conn)) {
        const t = raw.get(conn);
        out[name] = K.TYPE_NAMES[t] ?? `unknown(0x${t.toString(16).padStart(2, "0")})`;
      }
    }
    return out;
  }

  /** Pide al hub que informe de nuevo sus dispositivos y devuelve la nueva instantánea. */
  async refreshPorts() {
    await this._session.refreshPorts();
    return this.ports;
  }

  _select(typeCode, port) {
    this._session.core.checkUsable();
    const raw = this._session.portsRaw();
    const wanted = K.TYPE_NAMES[typeCode];
    if (port !== undefined && port !== null) {
      const conn = portConn(port);
      const found = raw.get(conn);
      const label = port.toUpperCase();
      if (found === undefined) throw new DeviceNotFoundError(`nothing is connected to port ${label}`);
      if (found !== typeCode) {
        throw new DeviceTypeError(`port ${label} holds a ${K.TYPE_NAMES[found] ?? "unknown device"}, not a ${wanted}`);
      }
      return conn;
    }
    const candidates = [K.CONN_PORT_A, K.CONN_PORT_B].filter((c) => raw.get(c) === typeCode);
    if (candidates.length === 0) throw new DeviceNotFoundError(`no ${wanted} is connected`);
    if (candidates.length > 1) {
      throw new AmbiguousDeviceError(`more than one ${wanted} is connected; pass the port ('A' or 'B')`);
    }
    return candidates[0];
  }

  motor(port) {
    const conn = this._select(K.TYPE_MOTOR, port);
    return new Motor(this._session, conn, CONN_PORT[conn]);
  }

  /** Un grupo de motores, p. ej. `hub.motors(["A", "B"])`; se acciona A primero y luego B. */
  motors(ports) {
    if (typeof ports === "string") throw new TypeError("ports must be an array such as ['A', 'B']");
    const list = [...ports];
    if (list.length === 0) throw new RangeError("ports must not be empty");
    const conns = list.map(portConn);
    if (new Set(conns).size !== conns.length) throw new RangeError(`duplicate port in ${JSON.stringify(list)}`);
    return new MotorGroup(conns.map((c) => this.motor(CONN_PORT[c])));
  }

  distanceSensor(port) {
    const conn = this._select(K.TYPE_MOTION, port);
    return new DistanceSensor(this._session, conn, CONN_PORT[conn]);
  }

  tiltSensor(port) {
    const conn = this._select(K.TYPE_TILT, port);
    return new TiltSensor(this._session, conn, CONN_PORT[conn]);
  }

  get led() { return this._led; }
  get button() { return this._button; }

  /** Gestor de tareas cooperativas de este hub (`add` / `wait` / `cancel`). */
  get tasks() { return this._session.tasks; }
}
