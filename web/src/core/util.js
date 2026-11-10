import { OperationTimeout } from "./errors.js";

/** Reloj monótono en segundos. */
export const now = () => performance.now() / 1000;

export const sleep = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

/**
 * Rechaza con el error devuelto por `onTimeout()` si `promise` no termina a tiempo.
 * No cancela la operación subyacente (Web Bluetooth no lo permite).
 */
export function withTimeout(promise, seconds, onTimeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(onTimeout()), seconds * 1000);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

export const timeoutError = (what, seconds) => () =>
  new OperationTimeout(`${what} agotó el tiempo de espera (${seconds.toFixed(1)} s)`);

/** Equivalente a una variable de condición: `wait` termina con `notify` o por tiempo. */
export class Signal {
  constructor() { this._waiters = new Set(); }
  notify() {
    const waiters = [...this._waiters];
    this._waiters.clear();
    for (const w of waiters) w();
  }
  wait(seconds) {
    return new Promise((resolve) => {
      const done = () => { clearTimeout(timer); this._waiters.delete(done); resolve(); };
      const timer = setTimeout(done, Math.max(0, seconds) * 1000);
      this._waiters.add(done);
    });
  }
}

/** Redondeo "half to even" como `round()` de Python (JS Math.round redondea .5 hacia +∞). */
export function pyRound(x) {
  const f = Math.floor(x);
  const d = x - f;
  if (d < 0.5) return f;
  if (d > 0.5) return f + 1;
  return f % 2 === 0 ? f : f + 1;
}

export class Emitter {
  constructor() { this._listeners = new Set(); }
  /** Suscribe `fn(type, detail)`; devuelve la función para cancelar. */
  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }
  emit(type, detail) {
    for (const fn of [...this._listeners]) {
      try { fn(type, detail); } catch (err) { console.error("listener error", err); }
    }
  }
}

export const hexString = (data) =>
  Array.from(data, (b) => b.toString(16).padStart(2, "0")).join(" ");
