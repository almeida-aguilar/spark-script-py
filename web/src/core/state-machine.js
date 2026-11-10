// Máquina de estados explícita del hub (equivalente a HubState/_TRANSITIONS del .pyx).
import { InvalidStateError } from "./errors.js";

export const HubState = Object.freeze({
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  DISCONNECTING: "disconnecting",
  SHUTDOWN: "shutdown",
  ERROR: "error",
});

const S = HubState;
export const TRANSITIONS = Object.freeze({
  [S.DISCONNECTED]: new Set([S.CONNECTING]),
  [S.CONNECTING]: new Set([S.CONNECTED, S.ERROR, S.DISCONNECTED]),
  [S.CONNECTED]: new Set([S.DISCONNECTING, S.ERROR, S.SHUTDOWN]),
  [S.DISCONNECTING]: new Set([S.DISCONNECTED, S.ERROR]),
  [S.SHUTDOWN]: new Set([S.CONNECTING, S.DISCONNECTED]),
  [S.ERROR]: new Set([S.CONNECTING, S.DISCONNECTING, S.DISCONNECTED]),
});

export class StateMachine {
  /** @param {(state: string, error: string|null) => void} [onChange] */
  constructor(onChange = () => {}) {
    this._state = S.DISCONNECTED;
    this._error = null;
    this._onChange = onChange;
  }

  get state() { return this._state; }
  get error() { return this._error; }

  /** Transición validada; no hace nada si el estado no cambia. */
  transition(next, error = null) {
    const old = this._state;
    if (next === old) return;
    if (!TRANSITIONS[old].has(next)) {
      throw new InvalidStateError(`invalid hub state transition ${old} -> ${next}`);
    }
    this._state = next;
    this._error = next === S.ERROR ? error : null;
    this._onChange(next, this._error);
  }

  /** Pasa a ERROR solo desde CONNECTED o CONNECTING (pérdida de enlace, watchdog). */
  forceError(cause) {
    if (this._state === S.CONNECTED || this._state === S.CONNECTING) {
      this.transition(S.ERROR, cause);
    }
  }
}
