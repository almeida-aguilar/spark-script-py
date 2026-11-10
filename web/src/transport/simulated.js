// Hub WeDo 2.0 en memoria para pruebas y demostraciones (port de SimulatedHub de Python).
//
// Reproduce lo observado en hardware real: una ráfaga de dispositivos internos al suscribirse
// a las notificaciones de puertos, dispositivos externos informados más tarde, eventos de
// puerto repetidos opcionales y valores de sensor notificados una vez tras la señal de inicio
// y después solo ante cambios.
//
// El ángulo de inclinación se emite como par int8 (lo que el firmware real envía, ver
// tests/conftest.py de la biblioteca Python). El decodificador acepta también float32.
//
// Inyección de fallos: freeze() (sin ACK), dropLink(), ackDelay, silentSensors,
// failConnect, failReads.
import * as K from "../core/constants.js";
import {
  BLEError, HubConnectionError, HubDisconnectedError, OperationTimeout,
} from "../core/errors.js";
import { sleep } from "../core/util.js";
import { Transport } from "./interfaces.js";

const TYPE_BY_NAME = { motor: K.TYPE_MOTOR, distance: K.TYPE_MOTION, tilt: K.TYPE_TILT };
const PORT_CONN = { A: K.CONN_PORT_A, B: K.CONN_PORT_B };
const INTERNAL = [
  [K.CONN_CURRENT, K.TYPE_CURRENT], [K.CONN_VOLTAGE, K.TYPE_VOLTAGE],
  [K.CONN_PIEZO, K.TYPE_PIEZO], [K.CONN_RGB, K.TYPE_RGB],
];
export const DIRECTION_CODES = Object.freeze({ none: 0, backward: 3, right: 5, left: 7, forward: 9 });

export const attachEvent = (conn, typ) =>
  Uint8Array.of(conn, 0x01, 0x00, typ, 0, 0, 0, 0x10, 0, 0, 0, 0x10);

const f32 = (x) => {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setFloat32(0, x, true);
  return out;
};

export class SimulatedTransport extends Transport {
  constructor(devices, {
    externalDelay = 0.05, repeatPorts = null, ackDelay = 0, silentSensors = false, failConnect = false,
  } = {}) {
    super();
    this.devices = { ...(devices ?? { A: "motor", B: "distance" }) };
    this.externalDelay = externalDelay;
    this.repeatPorts = repeatPorts; // segundos entre eventos de puerto duplicados, o null
    this.ackDelay = ackDelay;
    this.silentSensors = silentSensors;
    this.failConnect = failConnect;
    this.failReads = false; // las lecturas lanzan BLEError (fallo del heartbeat)
    this.frozen = false;
    this.dropped = false;
    this.connected = false;
    this.supportsDisconnectNotify = false;
    this.writes = []; // [[uuid, Uint8Array]]
    this.reads = []; // [uuid]
    this.motors = {}; // conn -> velocidad con signo escrita por última vez
    this.sensorModes = {}; // conn -> [type, mode]
    this.ledMode = null;
    this.button = false;
    this.distance = 0;
    this.tiltAngle = [0, 0];
    this.tiltCode = 0;
    this.battery = 87;
    this._notifying = new Set();
    this._onNotify = null;
    this._onDisconnect = null;
    this._closed = false;
    this._burstId = 0;
  }

  // -- controles de prueba ------------------------------------------------------

  freeze() { this.frozen = true; }
  unfreeze() { this.frozen = false; }

  dropLink(reason = "simulated link loss") {
    this.dropped = true;
    this.connected = false;
    this._onDisconnect?.(reason);
  }

  writesTo(uuid) { return this.writes.filter(([u]) => u === uuid).map(([, d]) => d); }

  press() { this.button = true; this._notify(K.CHAR_BUTTON, Uint8Array.of(1)); }
  release() { this.button = false; this._notify(K.CHAR_BUTTON, Uint8Array.of(0)); }

  setDistance(value) { this.distance = value; this._pushValues(K.TYPE_MOTION); }
  setTiltAngle(x, y) { this.tiltAngle = [Math.trunc(x), Math.trunc(y)]; this._pushValues(K.TYPE_TILT, K.TILT_ANGLE); }
  setTiltDirection(name) {
    this.tiltCode = typeof name === "string" ? DIRECTION_CODES[name] : Number(name);
    this._pushValues(K.TYPE_TILT, K.TILT_DIRECTION);
  }

  attach(port, kind) {
    this.devices[port] = kind;
    this._notify(K.CHAR_PORT, attachEvent(PORT_CONN[port], TYPE_BY_NAME[kind]));
  }

  detach(port) {
    delete this.devices[port];
    this._notify(K.CHAR_PORT, Uint8Array.of(PORT_CONN[port], 0x00));
  }

  // -- Transport ----------------------------------------------------------------

  setCallbacks(onNotify, onDisconnect) {
    this._onNotify = onNotify;
    this._onDisconnect = onDisconnect;
  }

  async connect(_timeout) {
    if (this.failConnect) throw new HubConnectionError("no WeDo 2.0 hub found");
    this.dropped = false;
    this.connected = true;
    this._closed = false;
  }

  async disconnect() {
    this.connected = false;
    this._notifying.clear();
    this._closed = true;
    this._burstId += 1; // cancela ráfagas de puertos en curso
  }

  hasCharacteristic(uuid) {
    return uuid === K.CHAR_DISCONNECT || [
      K.CHAR_BATTERY, K.CHAR_PORT, K.CHAR_SENSOR, K.CHAR_INPUT_CMD,
      K.CHAR_OUTPUT_CMD, K.CHAR_BUTTON, K.CHAR_TURN_OFF,
    ].includes(uuid);
  }

  async _gate(timeout) {
    if (this.dropped || !this.connected) throw new HubDisconnectedError("simulated link is down");
    if (this.frozen) {
      await sleep(timeout);
      throw new OperationTimeout("no ACK from the simulated hub");
    }
    if (this.ackDelay) {
      await sleep(this.ackDelay);
      if (this.dropped) throw new HubDisconnectedError("simulated link is down");
    }
  }

  async read(uuid, timeout) {
    await this._gate(timeout);
    if (this.failReads) throw new BLEError("simulated read failure");
    this.reads.push(uuid);
    if (uuid === K.CHAR_BATTERY) return Uint8Array.of(this.battery);
    if (uuid === K.CHAR_BUTTON) return Uint8Array.of(this.button ? 1 : 0);
    throw new BLEError(`characteristic not readable: ${uuid}`);
  }

  async write(uuid, data, timeout) {
    await this._gate(timeout);
    data = Uint8Array.from(data);
    this.writes.push([uuid, data]);
    if (uuid === K.CHAR_OUTPUT_CMD) {
      if (data.length === 4 && data[1] === 0x01 && data[2] === 0x01) {
        this.motors[data[0]] = (data[3] << 24) >> 24; // int8 con signo
      }
    } else if (uuid === K.CHAR_INPUT_CMD) {
      if (data.length >= 5 && data[0] === 0x01 && data[1] === 0x02) {
        const [conn, typ, mode] = [data[2], data[3], data[4]];
        this.sensorModes[conn] = [typ, mode];
        if (conn === K.CONN_RGB) this.ledMode = mode;
      } else if (data.length === 3 && data[0] === 0x00 && data[1] === 0x01) {
        this._pushConn(data[2]);
      }
    }
  }

  async subscribe(uuid, timeout) {
    await this._gate(timeout);
    if (uuid === K.CHAR_DISCONNECT && !this.supportsDisconnectNotify) {
      throw new BLEError("notifications not supported on this characteristic");
    }
    this._notifying.add(uuid);
    if (uuid === K.CHAR_PORT) this._portBurst(++this._burstId);
  }

  async unsubscribe(uuid, timeout) {
    await this._gate(timeout);
    this._notifying.delete(uuid);
  }

  // -- internos -----------------------------------------------------------------

  _notify(uuid, data) {
    if (this._onNotify && this._notifying.has(uuid)) this._onNotify(uuid, Uint8Array.from(data));
  }

  async _portBurst(id) {
    const alive = () => id === this._burstId && !this._closed;
    for (const [conn, typ] of INTERNAL) this._notify(K.CHAR_PORT, attachEvent(conn, typ));
    await sleep(this.externalDelay);
    if (!alive()) return;
    const events = Object.keys(this.devices).sort()
      .map((p) => attachEvent(PORT_CONN[p], TYPE_BY_NAME[this.devices[p]]));
    for (const ev of events) this._notify(K.CHAR_PORT, ev);
    while (this.repeatPorts && this._notifying.has(K.CHAR_PORT)) {
      await sleep(this.repeatPorts);
      if (!alive()) return;
      for (const ev of events) this._notify(K.CHAR_PORT, ev);
    }
  }

  _valueBytes(conn) {
    const [typ, mode] = this.sensorModes[conn] ?? [null, null];
    if (typ === K.TYPE_MOTION) return f32(this.distance);
    if (typ === K.TYPE_TILT) {
      if (mode === K.TILT_ANGLE) return Uint8Array.of(this.tiltAngle[0] & 0xff, this.tiltAngle[1] & 0xff);
      return f32(this.tiltCode);
    }
    return null;
  }

  _pushConn(conn) {
    if (this.silentSensors) return;
    const value = this._valueBytes(conn);
    if (value) this._notify(K.CHAR_SENSOR, Uint8Array.of(0x01, conn, ...value));
  }

  _pushValues(typ, mode = null) {
    for (const [conn, [t, m]] of Object.entries(this.sensorModes)) {
      if (t === typ && (mode === null || m === mode)) this._pushConn(Number(conn));
    }
  }
}
