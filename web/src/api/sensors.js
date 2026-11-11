// Sensores de distancia e inclinación (API v0.3.0).
//
//   distance = hub.distance("A")     # cm enteros 0..10
//   distance.read() / distance.has_change("increase") / distance.wait_change("decrease")
//
//   tilt = hub.tilt("B")             # dirección: left|right|forward|backward|none
//   tilt.read() / tilt.has_change("left")
//   tilt.x.read() / tilt.y.read()    # grados enteros -45..45
//   tilt.x.has_change("increase")
//
// El sensor de inclinación es un interruptor de 4 posiciones, no un acelerómetro.
// El modo dirección (1) entrega un float32 con el código de posición; el modo ángulo (0)
// entrega un par de int8 (x, y) y requiere UNIT_RAW (con UNIT_SI el hub acepta el
// comando pero nunca notifica). Como todos los sensores del hub, solo notifica cuando
// el valor cambia: si todavía no ha informado ninguno, read() lanza NoReadingError.
import * as K from "../core/constants.js";
import { BLEError, DeviceNotFoundError, DeviceTypeError, NoReadingError, PortError } from "../core/errors.js";
import { decodeScalar, decodeTiltAngle, tiltDirectionName } from "../core/protocol.js";
import { hexString } from "../core/util.js";

/**
 * Una lectura del coordinador, con los errores traducidos a la API pública:
 * un dispositivo retirado a mitad de espera es `PortError`; el tiempo agotado sin
 * recibir el primer valor del sensor, `NoReadingError`.
 */
async function callRead(session, label, ...args) {
  try {
    return await session.core.readSensor(...args);
  } catch (exc) {
    if (exc instanceof DeviceNotFoundError || exc instanceof DeviceTypeError) {
      throw new PortError(exc.message, { cause: exc });
    }
    if (exc.name === "OperationTimeout") {
      throw new NoReadingError(`${label}: todavía no hay ninguna lectura disponible`);
    }
    throw exc;
  }
}

function decode(fn, raw) {
  try {
    return fn(raw);
  } catch (exc) {
    if (exc instanceof RangeError) throw new BLEError(`unexpected sensor value ${hexString(raw)}: ${exc.message}`, { cause: exc });
    throw exc;
  }
}

/** Eje del sensor de inclinación (recurso independiente: sus cambios no se mezclan). */
export class TiltAxis {
  constructor(session, conn, port, axis) {
    this._session = session;
    this._conn = conn;
    this.port = port;
    this._axis = axis; // 0 = x, 1 = y
  }

  /** Etiqueta del recurso en los mensajes de error. */
  get label() {
    return `tilt (puerto "${this.port}") eje ${this._axis === 0 ? "x" : "y"}`;
  }

  /** Ángulo en grados, entero -45..45. */
  async read() {
    this._session.requireDevice(this._conn, K.TYPE_TILT);
    const raw = await callRead(this._session, this.label, this._conn, K.TYPE_TILT, K.TILT_ANGLE, K.UNIT_RAW, 2);
    const [x, y] = decode(decodeTiltAngle, raw);
    return this._axis === 0 ? x : y;
  }

  /** Consume los cambios pendientes ("increase" / "decrease"). */
  hasChange(filter = null) {
    this._session.requireUsable();
    const tracker = this._session.changes(this._conn).axis(this._axis);
    return tracker.consume(tracker.checkFilter(filter, this.label));
  }

  /** Espera un cambio y devuelve su tipo. */
  waitChange(filter = null) {
    this._session.requireUsable();
    const tracker = this._session.changes(this._conn).axis(this._axis);
    return tracker.wait(tracker.checkFilter(filter, this.label));
  }

  toString() { return `TiltAxis('${this.port}', '${this._axis === 0 ? "x" : "y"}')`; }
}

export class DistanceSensor {
  constructor(session, conn, port) {
    this._session = session;
    this._conn = conn;
    this.port = port;
  }

  /** Etiqueta del recurso en los mensajes de error. */
  get label() { return `distance (puerto "${this.port}")`; }

  /** Distancia en centímetros: entero 0..10 (no son centímetros reales, sino 0..10). */
  async read() {
    this._session.requireDevice(this._conn, K.TYPE_MOTION);
    const raw = await callRead(this._session, this.label, this._conn, K.TYPE_MOTION, K.DISTANCE_DETECT, K.UNIT_SI);
    const value = decode(decodeScalar, raw);
    if (!Number.isFinite(value)) throw new BLEError("the distance sensor reported a non-finite value");
    return Math.max(0, Math.min(10, Math.round(value)));
  }

  /** Consume los cambios pendientes ("increase" / "decrease"). */
  hasChange(filter = null) {
    this._session.requireUsable();
    const tracker = this._session.changes(this._conn).distance;
    return tracker.consume(tracker.checkFilter(filter, this.label));
  }

  /** Espera un cambio y devuelve su tipo. */
  waitChange(filter = null) {
    this._session.requireUsable();
    const tracker = this._session.changes(this._conn).distance;
    return tracker.wait(tracker.checkFilter(filter, this.label));
  }

  toString() { return `DistanceSensor('${this.port}')`; }
}

export class TiltSensor {
  constructor(session, conn, port) {
    this._session = session;
    this._conn = conn;
    this.port = port;
    this.x = new TiltAxis(session, conn, port, 0);
    this.y = new TiltAxis(session, conn, port, 1);
  }

  /** Etiqueta del recurso en los mensajes de error. */
  get label() { return `tilt (puerto "${this.port}")`; }

  /** Dirección: "left", "right", "forward", "backward" o "none". */
  async read() {
    this._session.requireDevice(this._conn, K.TYPE_TILT);
    const raw = await callRead(this._session, this.label, this._conn, K.TYPE_TILT, K.TILT_DIRECTION, K.UNIT_SI, 4);
    return decode(tiltDirectionName, raw);
  }

  /** Consume los cambios pendientes de dirección. */
  hasChange(filter = null) {
    this._session.requireUsable();
    const tracker = this._session.changes(this._conn).tilt;
    return tracker.consume(tracker.checkFilter(filter, this.label));
  }

  /** Espera un cambio de dirección y devuelve su tipo. */
  waitChange(filter = null) {
    this._session.requireUsable();
    const tracker = this._session.changes(this._conn).tilt;
    return tracker.wait(tracker.checkFilter(filter, this.label));
  }

  toString() { return `TiltSensor('${this.port}')`; }
}

export { NoReadingError };
