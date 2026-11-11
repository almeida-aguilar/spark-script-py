// Teclado (API v0.3.0): `key("space")`, del módulo (no pertenece al hub).
//
//   const space = key("space");
//   await space.read();              // ¿está presionada?
//   await space.hasChange("pressed") // consume los cambios pendientes
//   await space.waitChange("released")
//
// El teclado NO forma parte del hub físico: no requiere crear un `Hub` ni que esté
// conectado, y sus recursos no aparecen en `ports()`. La captura se activa en el primer
// uso de cualquier tecla, recoge las pulsaciones y liberaciones solo con el foco de la
// página, ignora la repetición automática y, al perder el foco, libera todas las teclas
// (cada una registra "released") para que ninguna quede atascada. La captura se libera
// al terminar el programa (interrprete); ni `disconnect()` ni la salida de un `with`
// (del lado Python) la afectan.
import { ChangeTracker } from "./change-tracker.js";
import { KeyboardUnavailableError } from "../core/errors.js";

/** Nombres válidos de tecla: conjunto cerrado (los mensajes lo listan como texto). */
export const KEY_LIST = "a-z, 0-9, up, down, left, right, space, enter, escape, tab, backspace, shift, control, alt";

/** Nombres válidos de tecla: una letra o dígito, o uno de los nombres especiales. */
const KEY_PATTERN = /^(?:[a-z0-9]|up|down|left|right|space|enter|escape|tab|backspace|shift|control|alt)$/;

const NAMED = new Map([
  ["arrowup", "up"],
  ["arrowdown", "down"],
  ["arrowleft", "left"],
  ["arrowright", "right"],
  [" ", "space"],
  ["enter", "enter"],
  ["escape", "escape"],
  ["tab", "tab"],
  ["backspace", "backspace"],
  ["shift", "shift"],
  ["control", "control"],
  ["alt", "alt"],
]);

/**
 * Traduce un evento del navegador al nombre de la API, o `null` si la tecla no se
 * captura (sin repetición automática; ni teclado numérico ni funciones ni multimedia).
 */
export function eventKeyName(event) {
  if (event.repeat) return null;
  if (typeof event.code === "string" && event.code.startsWith("Numpad")) return null;
  const raw = String(event.key ?? "");
  const lower = raw.toLowerCase();
  if (NAMED.has(lower)) return NAMED.get(lower); // incluye " " (espaciadora)
  if (raw.length === 1) {
    return (lower >= "a" && lower <= "z") || (lower >= "0" && lower <= "9") ? lower : null;
  }
  return null;
}

/**
 * Captura compartida de todas las teclas. Es del módulo (una por aplicación), no de la
 * sesión: dos manejadores de la misma tecla comparten estado y cambios pendientes.
 * `target` es inyectable para las pruebas (por defecto, la ventana del navegador).
 */
export class KeyboardCapture {
  constructor(target = undefined) {
    this._target = target === undefined ? globalThis.window : target;
    this._pressed = new Set();
    this._trackers = new Map(); // nombre -> ChangeTracker
    this._active = false;
    this._onKeyDown = (e) => this._observe(e, true);
    this._onKeyUp = (e) => this._observe(e, false);
    this._onBlur = () => this.releaseAll();
  }

  /** El rastreador de cambios de una tecla. */
  tracker(name) {
    let t = this._trackers.get(name);
    if (!t) { t = new ChangeTracker(["pressed", "released"], { firstIsChange: true }); this._trackers.set(name, t); }
    return t;
  }

  /**
   * Activa la captura en el primer uso de cualquier tecla. Si el entorno no puede
   * entregar eventos de pulsación y liberación, lanza `KeyboardUnavailableError`.
   */
  use() {
    if (this._active) return;
    if (!this._target || typeof this._target.addEventListener !== "function") {
      throw new KeyboardUnavailableError("teclado no disponible en este entorno");
    }
    this._target.addEventListener("keydown", this._onKeyDown);
    this._target.addEventListener("keyup", this._onKeyUp);
    this._target.addEventListener("blur", this._onBlur);
    this._active = true;
  }

  /** Libera la captura (y desactiva las teclas presionadas, con su "released"). */
  release() {
    if (!this._active) return;
    this._target.removeEventListener("keydown", this._onKeyDown);
    this._target.removeEventListener("keyup", this._onKeyUp);
    this._target.removeEventListener("blur", this._onBlur);
    this._active = false;
    this.releaseAll();
  }

  /** Descarta el estado y los cambios pendientes (al iniciar el programa). */
  reset() {
    this._pressed.clear();
    for (const t of this._trackers.values()) t.reset();
  }

  get active() { return this._active; }

  /** ¿Está presionada la tecla? (sin activar la captura no hay estado registrado). */
  isPressed(name) { return this._pressed.has(name); }

  /** Todas las teclas presionadas pasan a no presionadas, registrando su "released". */
  releaseAll() {
    for (const name of [...this._pressed]) this._settle(name, false);
  }

  _observe(event, pressed) {
    const name = eventKeyName(event);
    if (name === null) return;
    this._settle(name, pressed);
  }

  _settle(name, pressed) {
    if (pressed) {
      if (this._pressed.has(name)) return;
      this._pressed.add(name);
      this.tracker(name).observe(true, (prev) => (prev !== true ? "pressed" : null));
    } else {
      if (!this._pressed.has(name)) return;
      this._pressed.delete(name);
      this.tracker(name).observe(false, (prev) => (prev !== false ? "released" : null));
    }
  }
}

/** La captura del módulo: una por aplicación, independiente de los hubs. */
const sharedCapture = new KeyboardCapture();

/**
 * Una tecla del teclado: `key("space")`. No requiere crear un `Hub` ni conexión.
 * El conjunto de nombres es cerrado: un nombre desconocido lanza `RangeError`
 * (equivalente a `ValueError`) al seleccionar la tecla, no al usarla.
 */
export function key(name) {
  if (typeof name !== "string") {
    throw new TypeError(`key: la tecla esperaba una cadena y recibió ${typeof name}`);
  }
  const lower = name.toLowerCase();
  if (!KEY_PATTERN.test(lower)) {
    throw new RangeError(`tecla "${name}" no válida (teclas válidas: ${KEY_LIST})`);
  }
  return new Key(sharedCapture, lower);
}

/** Libera la captura del teclado (al terminar el programa; lo usa el runtime). */
export function releaseKeyboard() { sharedCapture.release(); }

/** Descarta el estado y los cambios pendientes (al iniciar el programa; lo usa el runtime). */
export function resetKeyboard() { sharedCapture.reset(); }

/** Una tecla del teclado: recurso de entrada con el mismo vocabulario que el botón. */
export class Key {
  constructor(capture, name) {
    this._capture = capture;
    this.name = name;
  }

  /** Etiqueta del recurso en los mensajes de error. */
  get label() { return `tecla "${this.name}"`; }

  /** `true` si está presionada. Nunca lanza `NoReadingError`: siempre tiene estado. */
  read() {
    this._capture.use();
    return this._capture.isPressed(this.name);
  }

  /** Consume los cambios pendientes ("pressed" / "released"). */
  hasChange(filter = null) {
    this._capture.use();
    const tracker = this._capture.tracker(this.name);
    return tracker.consume(tracker.checkFilter(filter, this.label));
  }

  /** Espera un cambio y devuelve su tipo. */
  waitChange(filter = null) {
    this._capture.use();
    const tracker = this._capture.tracker(this.name);
    return tracker.wait(tracker.checkFilter(filter, this.label));
  }

  toString() { return `Key('${this.name}')`; }
}
