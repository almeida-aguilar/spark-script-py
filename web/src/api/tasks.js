// Tareas cooperativas (equivalente a src/wedopy/tasks.py y task.py).
//
// En Python las tareas son generadores que ceden con `yield task.sleep(...)`. En JavaScript
// son funciones (async) que reciben un contexto `ctx` y esperan con `await ctx.sleep(...)`:
//
//   hub.tasks.add(async (ctx) => { await led.on(); await ctx.sleep(0.3); await led.off(); });
//   await hub.tasks.wait();
//
// Un solo hilo, cambio de tarea solo en los `await`. Las tareas canceladas reciben
// TaskCancelled en su siguiente `ctx.sleep()` / `ctx.yieldNow()`, de modo que sus bloques
// `finally` (p. ej. parar un motor) se ejecutan antes de que se cierre el hub.
import { InvalidStateError } from "../core/errors.js";
import { withTimeout } from "../core/util.js";

/** Se lanza dentro de una tarea cancelada. No es un error: el gestor la absorbe. */
export class TaskCancelled extends Error {
  constructor() { super("task cancelled"); this.name = "TaskCancelled"; }
}

function checkSeconds(seconds) {
  if (typeof seconds !== "number") throw new TypeError(`seconds must be a number, not ${typeof seconds}`);
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError(`seconds must be a finite number >= 0, got ${seconds}`);
  }
  return seconds;
}

function abortableDelay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new TaskCancelled()); return; }
    const onAbort = () => { clearTimeout(timer); reject(new TaskCancelled()); };
    const timer = setTimeout(() => { signal?.removeEventListener("abort", onAbort); resolve(); }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/** Suspende la tarea actual al menos `seconds` mientras las demás siguen. */
export function sleep(seconds, signal) {
  checkSeconds(seconds);
  return abortableDelay(seconds * 1000, signal);
}

/** Pasa la tarea actual al final de la cola sin pausarla. */
export function yieldNow(signal) {
  return abortableDelay(0, signal);
}

/** Instrucciones de planificación generales (no dependen de ningún hub). */
export const task = Object.freeze({ sleep, yieldNow });

class TaskContext {
  constructor(signal, manager) { this.signal = signal; this._manager = manager; }
  get cancelled() { return this.signal.aborted; }
  /**
   * Cancela todas las tareas desde dentro de una tarea, sin esperar (no bloquea). Las demás se
   * cierran ya; la actual, en su siguiente `ctx.sleep()`. No uses `await tasks.cancel()` aquí:
   * esperaría a la propia tarea.
   */
  cancelAll() { this._manager._cancelNow(); }
  sleep(seconds) { return sleep(seconds, this.signal); }
  yieldNow() { return yieldNow(this.signal); }
}

const nameOf = (fn) => fn.name || "anonymous";

export class TaskManager {
  /** @param {{onInterrupt?: () => Promise<void>|void, cancelTimeout?: number}} [opts] */
  constructor({ onInterrupt = null, cancelTimeout = 2.0 } = {}) {
    this._onInterrupt = onInterrupt;
    this._cancelTimeout = cancelTimeout;
    this._pending = []; // registradas, aún sin iniciar
    this._running = new Set(); // tareas iniciadas y no terminadas
    this._normal = 0; // tareas normales vivas (pendientes + en ejecución)
    this._waiting = false;
    this._failure = null;
    this._wakeWait = null;
    /** Errores secundarios del último wait(): [[nombre, error]] */
    this.diagnostics = [];
  }

  /** Registra una tarea. Empieza a ejecutarse dentro de `wait()`. */
  add(func, options = {}) {
    if (typeof func !== "function") throw new TypeError(`a task must be a function, not ${typeof func}`);
    if (options === null || typeof options !== "object") {
      throw new TypeError("options must be an object such as { background: true }");
    }
    const { background = false } = options;
    if (typeof background !== "boolean") throw new TypeError("background must be true or false");
    const t = { func, name: nameOf(func), background, controller: new AbortController(), promise: null, finished: false };
    if (!background) this._normal += 1;
    if (this._waiting) this._launch(t); else this._pending.push(t);
  }

  /**
   * Ejecuta las tareas hasta que terminen todas las normales; después cancela las de fondo.
   * Si una tarea falla, cancela el resto, ejecuta sus `finally` y relanza el error original.
   * `signal` (AbortSignal) hace de "Ctrl+C": cancela, llama a `onInterrupt` y relanza.
   */
  async wait({ signal } = {}) {
    if (this._waiting) throw new InvalidStateError("wait() cannot be called from a task or during another wait()");
    this._waiting = true;
    this.diagnostics = [];
    // La interrupción se registra de inmediato y wait() no vuelve hasta que termine el
    // trabajo de cancelación y `onInterrupt` (p. ej. parar los motores).
    const onAbort = () => {
      this._interruptedBy = signal.reason ?? new DOMException("aborted", "AbortError");
      this._interruptWork = (async () => {
        await this.cancel();
        try { await this._onInterrupt?.(); } catch { /* mejor esfuerzo */ }
      })();
    };
    this._interruptedBy = null;
    this._interruptWork = null;
    signal?.addEventListener("abort", onAbort, { once: true });
    try {
      const pending = this._pending;
      this._pending = [];
      for (const t of pending) {
        if (this._failure !== null) this._finish(t); // un fallo cancela el resto: no se inician
        else this._launch(t);
      }
      if (this._normal > 0 && this._failure === null && !this._interruptedBy) {
        await new Promise((resolve) => { this._wakeWait = resolve; });
        this._wakeWait = null;
      }
      if (this._failure === null && !this._interruptedBy) {
        for (const t of this._running) if (t.background) t.controller.abort();
      } else {
        this._abortAll();
      }
      await this._settle();
      if (this._interruptWork) await this._interruptWork;
    } finally {
      signal?.removeEventListener("abort", onAbort);
      this._waiting = false;
    }
    const interrupted = this._interruptedBy;
    this._interruptedBy = null;
    const failure = this._failure;
    this._failure = null;
    if (interrupted) throw interrupted;
    if (failure) throw failure;
  }

  /**
   * Cierra todas las tareas (normales y de fondo) y espera (con tope) a que terminen sus
   * `finally`. No para los motores. Desde fuera de las tareas. Dentro de una tarea usa
   * `ctx.cancelAll()`, porque `await cancel()` esperaría a la propia tarea.
   */
  async cancel() {
    this._cancelNow();
    await this._settle();
  }

  // -- internos ---------------------------------------------------------------------

  _abortAll() {
    for (const t of this._running) t.controller.abort();
  }

  _cancelNow() {
    for (const t of this._pending) this._finish(t);
    this._pending = [];
    this._abortAll();
  }

  async _settle() {
    if (this._running.size === 0) return;
    const all = Promise.allSettled([...this._running].map((t) => t.promise));
    await withTimeout(all, this._cancelTimeout, () => null).catch(() => {});
  }

  _launch(t) {
    const ctx = new TaskContext(t.controller.signal, this);
    this._running.add(t);
    t.promise = this._run(t, ctx);
  }

  async _run(t, ctx) {
    try {
      await t.func(ctx);
    } catch (exc) {
      if (!(exc instanceof TaskCancelled)) this._fail(t, exc);
    } finally {
      this._running.delete(t);
      this._finish(t);
    }
  }

  _finish(t) {
    if (t.finished) return;
    t.finished = true;
    if (!t.background) this._normal -= 1;
    if (this._normal <= 0 || this._failure !== null) this._wakeWait?.();
  }

  _fail(t, exc) {
    if (this._failure === null && !t.controller.signal.aborted) {
      this._failure = exc;
      try { exc.taskName = t.name; } catch { /* error no extensible */ }
      this._abortAll();
      this._wakeWait?.();
    } else {
      this.diagnostics.push([t.name, exc]);
    }
  }
}
