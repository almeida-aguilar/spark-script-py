// Botón integrado del hub (API v0.2.0): `hub.button`.
//
//   hub.button.read()                  -> bool
//   hub.button.has_change("pressed")   -> bool (consume los cambios pendientes)
//   hub.button.wait_change("released") -> str  (tipo consumido)
import { NotConnectedError } from "../core/errors.js";

export class Button {
  constructor(session) { this._session = session; }

  /** `true` si está presionado. */
  read() {
    this._session.requireUsable();
    return this._session.core.buttonPressed();
  }

  /** Consume los cambios pendientes ("pressed" / "released"). */
  hasChange(filter = null) {
    this._session.requireUsable();
    const tracker = this._session.changes("button").button;
    return tracker.consume(tracker.checkFilter(filter, "button"));
  }

  /** Espera un cambio y devuelve su tipo. */
  waitChange(filter = null) {
    this._session.requireUsable();
    const tracker = this._session.changes("button").button;
    return tracker.wait(tracker.checkFilter(filter, "button"));
  }

  toString() { return "Button()"; }
}

export { NotConnectedError };
