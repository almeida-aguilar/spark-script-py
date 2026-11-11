// Seguimiento de cambios de un recurso de entrada (API v0.3.0).
//
// Cada recurso (distancia, inclinación, botón) mantiene sus propios cambios pendientes:
// `has_change()` los consulta y los consume, `wait_change()` espera a que llegue uno.
//
// Reglas:
// - Sin filtro se consumen todos los pendientes; con filtro, solo los de ese tipo.
// - Un mismo tipo que ocurre varias veces antes de consultarse cuenta una sola vez.
// - Los tipos distintos se conservan a la vez ("pressed" y "released").
// - El primer valor recibido establece el estado de partida y no cuenta como cambio.
// - Los cambios se descartan al conectar y al desconectar.
import { NotConnectedError } from "../core/errors.js";

/**
 * Cambios pendientes de los recursos de una conexión (o del botón integrado).
 * Vive en la sesión, no en el manejador: dos manejadores del mismo puerto comparten
 * los mismos cambios pendientes.
 */
export class ResourceChanges {
  constructor() {
    this.distance = new ChangeTracker(["increase", "decrease"]);
    this.tilt = new ChangeTracker(["left", "right", "forward", "backward", "none"]);
    this._axes = [
      new ChangeTracker(["increase", "decrease"]),
      new ChangeTracker(["increase", "decrease"]),
    ];
    this.button = new ChangeTracker(["pressed", "released"], { firstIsChange: true });
  }

  /** Cambios del eje X (0) o Y (1) del inclinómetro. */
  axis(index) { return this._axes[index]; }

  /** Descarta todos los cambios pendientes (al conectar o desconectar). */
  reset() {
    this.distance.reset();
    this.tilt.reset();
    this._axes.forEach((t) => t.reset());
    this.button.reset();
  }
}

export class ChangeTracker {
  /**
   * Cambios de un recurso de entrada: `hasChange()` consulta y consume, `wait()` espera.
   *
   * Reglas: sin filtro se consumen todos los pendientes; con filtro, solo los de ese
   * tipo; un mismo tipo repetido cuenta una sola vez; el primer valor establece el
   * estado de partida (o cuenta como cambio, con `firstIsChange`).
   *
   * @param {string[]} filters filtros admitidos por el recurso
   * @param {object} [opts]
   * @param {boolean} [opts.firstIsChange] cuando no hay datos previos (botón: no hay
   *   notificaciones, solo cambios), el primer valor recibido cuenta como cambio.
   */
  constructor(filters = [], opts = {}) {
    this._filters = new Set(filters); // filtros admitidos por el recurso
    this._firstIsChange = Boolean(opts.firstIsChange);
    this._pending = []; // tipos pendientes, en orden de llegada (sin repetir)
    this._waiters = []; // esperas en curso: { filter, resolve, reject }
    this._baseline = undefined; // primer valor: no cuenta como cambio
  }

  /** Filtros admitidos por este recurso. */
  get filters() { return [...this._filters]; }

  /**
   * Valida el filtro: `null` (sin filtro) o un tipo admitido. `label` identifica el
   * recurso en el mensaje (`button`, `distance (puerto "a")`…).
   */
  checkFilter(filter, label = "recurso") {
    if (filter === null || filter === undefined) return null;
    if (typeof filter !== "string") {
      throw new TypeError(`${label}: el filtro esperaba una cadena y recibió ${typeof filter}`);
    }
    if (!this._filters.has(filter)) {
      const list = [...this._filters].map((f) => `"${f}"`).join(", ");
      throw new RangeError(`${label}: filtro "${filter}" no admitido (admitidos: ${list})`);
    }
    return filter;
  }

  /**
   * Registra el valor recibido del dispositivo. `classify(prev, next)` devuelve el tipo de
   * cambio (o `null` si el valor no cambió). Devuelve el tipo registrado, si lo hubo.
   */
  observe(value, classify) {
    if (this._baseline === undefined) {
      const previous = undefined;
      this._baseline = value;
      const type = classify(previous, value);
      if (type === null || type === undefined || !this._firstIsChange) return null;
      this._record(type);
      return type;
    }
    const previous = this._baseline;
    this._baseline = value;
    const type = classify(previous, value);
    if (type === null || type === undefined) return null;
    this._record(type);
    return type;
  }

  /** Registra un cambio pendiente (sin duplicar el mismo tipo). */
  _record(type) {
    if (!this._pending.includes(type)) this._pending.push(type);
    this._wake();
  }

  /** Tipos pendientes sin consumir. */
  pending() { return [...this._pending]; }

  /** Consulta y consume: `true` si había cambios (del tipo pedido). */
  consume(filter = null) {
    if (filter === null) {
      const any = this._pending.length > 0;
      this._pending = [];
      return any;
    }
    const idx = this._pending.indexOf(filter);
    if (idx >= 0) { this._pending.splice(idx, 1); return true; }
    return false;
  }

  /** Descarta los cambios pendientes (al conectar o desconectar). */
  reset() {
    this._pending = [];
    this._baseline = undefined;
    const waiters = this._waiters;
    this._waiters = [];
    for (const w of waiters) w.reject(new NotConnectedError("hub no conectado"));
  }

  /**
   * Espera un cambio. Resuelve con el tipo consumido. Si ya había uno pendiente que
   * coincide, se consume y se devuelve sin esperar.
   */
  wait(filter = null) {
    if (filter !== null && this.consume(filter)) return Promise.resolve(filter);
    if (filter === null) {
      const oldest = this._pending[0];
      if (oldest !== undefined) { this._pending.shift(); return Promise.resolve(oldest); }
    }
    return new Promise((resolve, reject) => {
      this._waiters.push({ filter, resolve, reject });
    });
  }

  /** Resuelve la espera más antigua compatible con el cambio recibido. */
  _wake() {
    for (let i = 0; i < this._waiters.length; i += 1) {
      const w = this._waiters[i];
      const match = w.filter === null ? this._pending.length > 0 : this._pending.includes(w.filter);
      if (!match) continue;
      const type = w.filter === null ? this._pending.shift() : w.filter;
      if (w.filter !== null) {
        const idx = this._pending.indexOf(w.filter);
        if (idx >= 0) this._pending.splice(idx, 1);
      }
      this._waiters.splice(i, 1);
      w.resolve(type);
      return;
    }
  }
}
