// Motores (API v0.2.0): `hub.motor("A")`.
//
//   motor.run(50)   # -100..100; el signo es el sentido, el valor absoluto la intensidad
//   motor.stop()     # alias de run(0)
//
// No hay grupo de motores: para actuar sobre los dos se hacen dos llamadas explícitas,
// así queda claro qué periférico recibe cada orden. El selector no exige conexión: los
// errores de puerto aparecen al usar el manejador.
import * as K from "../core/constants.js";

const SPEEDS = "-100..100";

/** El dispositivo solo admite enteros: un valor con parte decimal se redondea. */
function checkSpeed(speed, port) {
  if (typeof speed !== "number") {
    throw new TypeError(`motor (puerto "${port}"): run esperaba un número y recibió ${typeof speed}`);
  }
  if (!Number.isFinite(speed) || speed < -100 || speed > 100) {
    throw new RangeError(`motor (puerto "${port}"): el valor ${speed} está fuera del rango ${SPEEDS}`);
  }
  return Math.round(speed);
}

export class Motor {
  /** Un motor en el puerto indicado. El signo de la velocidad es una dirección lógica. */
  constructor(session, conn, port) {
    this._session = session;
    this._conn = conn;
    this.port = port;
  }

  /** Fija la velocidad lógica, -100..100. `run(0)` equivale a `stop()`. */
  run(speed) {
    const value = checkSpeed(speed, this.port);
    this._session.requireDevice(this._conn, K.TYPE_MOTOR);
    return this._session.core.setMotor(this._conn, value);
  }

  /** Pide parar el motor (alias de `run(0)`). */
  stop() {
    this._session.requireDevice(this._conn, K.TYPE_MOTOR);
    return this._session.core.setMotor(this._conn, 0);
  }

  toString() { return `Motor('${this.port}')`; }
}
