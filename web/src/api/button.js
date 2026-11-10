// Botón integrado (equivalente a src/wedopy/button.py).
export class Button {
  constructor(session) { this._session = session; }

  /** Lanza HubDisconnectedError / InvalidStateError si el hub no está utilizable. */
  get isPressed() { return this._session.core.buttonPressed(); }
  get isReleased() { return !this.isPressed; }
}
