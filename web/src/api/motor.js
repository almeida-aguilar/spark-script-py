// Motores (equivalente a src/wedopy/motor.py).

function checkSpeed(speed) {
  if (typeof speed !== "number" || !Number.isInteger(speed)) {
    throw new TypeError(`speed must be an integer in -100..100, not ${typeof speed === "number" ? speed : typeof speed}`);
  }
  if (speed < -100 || speed > 100) throw new RangeError(`speed must be in -100..100, got ${speed}`);
  return speed;
}

export class Motor {
  /** Un motor en el puerto `A` o `B`. El signo de `speed` es una dirección lógica. */
  constructor(session, conn, port) {
    this._session = session;
    this._conn = conn;
    this.port = port;
  }

  /** Fija la velocidad lógica, -100..100. `run(0)` equivale a `stop()`. */
  run(speed) {
    return this._session.core.setMotor(this._conn, checkSpeed(speed));
  }

  /** Pide parar el motor. El ACK confirma la comunicación, no que el eje se haya detenido. */
  stop() {
    return this._session.core.setMotor(this._conn, 0);
  }

  toString() { return `Motor('${this.port}')`; }
}

export class MotorGroup {
  /** Varios motores accionados en orden determinista (A, luego B). No es atómico. */
  constructor(motors) {
    this._motors = [...motors].sort((a, b) => (a.port < b.port ? -1 : a.port > b.port ? 1 : 0));
  }

  async run(speed) {
    checkSpeed(speed);
    for (const m of this._motors) await m.run(speed);
  }

  /** Intenta parar todos; lanza el primer error tras intentarlos todos. */
  async stop() {
    let first = null;
    for (const m of this._motors) {
      try { await m.stop(); } catch (exc) { first ??= exc; }
    }
    if (first) throw first;
  }

  toString() { return `MotorGroup(${this._motors.map((m) => `'${m.port}'`).join(", ")})`; }
}
