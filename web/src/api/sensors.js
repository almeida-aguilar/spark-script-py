// Sensores de distancia e inclinación (equivalente a src/wedopy/sensors.py).
import * as K from "../core/constants.js";
import { BLEError } from "../core/errors.js";
import { decodeScalar, decodeTiltAngle, tiltDirectionName } from "../core/protocol.js";
import { hexString, pyRound } from "../core/util.js";

function decode(fn, raw) {
  try {
    return fn(raw);
  } catch (exc) {
    if (exc instanceof RangeError) throw new BLEError(`unexpected sensor value ${hexString(raw)}: ${exc.message}`, { cause: exc });
    throw exc;
  }
}

export class DistanceSensor {
  /** Valores enteros normalizados 0..10, no centímetros. */
  constructor(session, conn, port) {
    this._session = session;
    this._conn = conn;
    this.port = port;
  }

  async read() {
    const raw = await this._session.core.readSensor(this._conn, K.TYPE_MOTION, K.DISTANCE_DETECT, K.UNIT_SI);
    const value = decode(decodeScalar, raw);
    if (!Number.isFinite(value)) throw new BLEError("the distance sensor reported a non-finite value");
    return Math.max(0, Math.min(10, pyRound(value)));
  }

  static _threshold(threshold) {
    if (typeof threshold !== "number") throw new TypeError("threshold must be a number");
    if (!Number.isFinite(threshold) || threshold < 0 || threshold > 10) {
      throw new RangeError("threshold must be a finite number in 0..10");
    }
    return threshold;
  }

  /** `true` cuando `read() < threshold` (estricto). */
  async isNear(threshold) {
    const t = DistanceSensor._threshold(threshold);
    return (await this.read()) < t;
  }

  /** `true` cuando `read() > threshold` (estricto). */
  async isFar(threshold) {
    const t = DistanceSensor._threshold(threshold);
    return (await this.read()) > t;
  }

  toString() { return `DistanceSensor('${this.port}')`; }
}

export class TiltSensor {
  /**
   * El sensor de inclinación del WeDo 2.0 es un interruptor de 4 posiciones, no un acelerómetro.
   * Modo dirección (1): UNIT_SI, float32. Modo ángulo (0): REQUIERE UNIT_RAW y un par int8
   * (con UNIT_SI el hub acepta el comando pero nunca notifica). El modo golpe (2) no existe en
   * el firmware. Como todos los sensores del hub, solo notifica cuando el valor cambia.
   */
  constructor(session, conn, port) {
    this._session = session;
    this._conn = conn;
    this.port = port;
  }

  /** `[x, y]` en grados, nominalmente -45..45. */
  async readAngle() {
    const raw = await this._session.core.readSensor(this._conn, K.TYPE_TILT, K.TILT_ANGLE, K.UNIT_RAW, 2);
    return decode(decodeTiltAngle, raw);
  }

  /** Una de `neutral`, `back`, `right`, `left`, `forward`. */
  async readDirection() {
    const raw = await this._session.core.readSensor(this._conn, K.TYPE_TILT, K.TILT_DIRECTION, K.UNIT_SI, 4);
    return decode(tiltDirectionName, raw);
  }

  toString() { return `TiltSensor('${this.port}')`; }
}
