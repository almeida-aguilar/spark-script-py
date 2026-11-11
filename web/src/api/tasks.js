// Tareas cooperativas de la API v0.3.0: `task`, del módulo (las tareas son del
// programa y no del hub; hay un único planificador por aplicación).
//
//   import { task } from spark-script-py;
//   const t = task.spawn(fn)   // fn es cualquier invocable (función JS o Python)
//   await task.wait(1)         // suspende el flujo actual (cooperativo)
//   t.cancel() / t.join()
//
// En el navegador cada tarea corre en su propia pila: las de Python se invocan con
// `callPromising()` (JSPI), así que mientras una espera, las demás avanzan de verdad.
//
// Cancelación segura. En Pyodide, RECHAZAR una promesa cuyo resultado espera `run_sync`
// deja continuaciones de pila huérfanas (probadó con trazas: la pila se abandona y el
// error reaparece después sin dueño). Por eso la cancelación NUNCA rechaza: se RESUELVE
// la espera pendiente con un marcador ("ok" | "cancelled" | "stopped") y es el lado de
// Python quien, al recuperar el control, lanza la excepción en su propia pila:
//
//   - `cancel(taskId)` -> la siguiente espera de esa tarea se resuelve con "cancelled"
//     y Python lanza `TaskCancelled` (cooperativa y persistente: el pedido queda
//     registrado aunque el marcador se pierda).
//   - «Detener» (`interruptAll`) -> todas las esperas se resuelven ("stopped" el flujo
//     principal, "cancelled" las tareas) y Python lanza KeyboardInterrupt / TaskCancelled.
import { TaskCancelled } from "../core/errors.js";

export { TaskCancelled };

const MARK = { ok: "ok", cancelled: "cancelled", stopped: "stopped" };

function checkSeconds(seconds) {
  if (typeof seconds !== "number") throw new TypeError(`seconds must be a number, not ${typeof seconds}`);
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError(`seconds must be a finite number >= 0, got ${seconds}`);
  }
  return seconds;
}

/** Envoltorio público de una tarea para la API JavaScript. */
export class Task {
  constructor(manager, id) {
    this._manager = manager;
    this._id = id;
  }

  /** Identificador interno de la tarea. */
  get id() { return this._id; }

  /** "scheduled", "running", "finished" o "failed". */
  get state() { return this._manager.state(this._id); }

  /** Pide cancelar la tarea (cooperativa y persistente). */
  cancel() { this._manager.cancel(this._id); }

  /** Espera a que la tarea termine (no propaga su error). */
  join() { return this._manager.join(this._id, undefined); }

  toString() { return `Task(${this._id})`; }
}

/**
 * Planificador: vende suspensiones con marcadores y despacha por id.
 * Una tarea es `{ id, callable, state, pending, cancelRequested, joiners, error }`.
 */
export class TaskManager {
  constructor() {
    this._tasks = new Map(); // id -> tarea
    this._main = new Set(); // suspensiones del flujo principal
    this._counter = 0;
    this._allWaiters = [];
  }

  _nextId() {
    this._counter += 1;
    return this._counter;
  }

  /** Crea y arranca una tarea con el id dado; el invocable puede ser JS o Python. */
  spawn(id, callable) {
    const task = {
      id, callable, state: "running", pending: null,
      cancelRequested: false, joiners: [], error: null, result: null,
    };
    this._tasks.set(id, task);
    this._start(task);
    return id;
  }

  _start(task) {
    let promise;
    try {
      // Las tintas de Python entran con su propia pila (callPromising); las de JS, a síncrono.
      promise = typeof task.callable?.callPromising === "function"
        ? task.callable.callPromising()
        : Promise.resolve().then(() => task.callable());
    } catch (exc) {
      this._finish(task, "failed", exc);
      return;
    }
    promise = promise.then(
      (value) => { task.result = value; this._finish(task, "finished", null); },
      (error) => { this._finish(task, "failed", error); },
    );
    task.promise = promise;
    promise.catch(() => {}); // el error se guarda en la tarea; la promesa no queda suelta
  }

  _finish(task, state, error) {
    task.state = state;
    task.error = error ?? null;
    if (task.pending) { const p = task.pending; task.pending = null; p.settle(MARK.ok); }
    const joiners = task.joiners;
    task.joiners = [];
    for (const j of joiners) j.handle.settle(MARK.ok);
    if (this._live() === 0) {
      const waiters = this._allWaiters;
      this._allWaiters = [];
      for (const w of waiters) w();
    }
  }

  _live() {
    let n = 0;
    for (const t of this._tasks.values()) if (t.state === "running") n += 1;
    return n;
  }

  /**
   * Punto de suspensión. `id` es `undefined`/`null` para el flujo principal. Resuelve con
   * el marcador; quien llama (Python o JS) reacciona a "cancelled"/"stopped".
   */
  wait(id, seconds) {
    checkSeconds(seconds);
    const deadline = setTimeout(() => handle.settle(MARK.ok), seconds * 1000);
    const task = id == null ? null : this._tasks.get(id);
    let settle;
    const promise = new Promise((r) => { settle = r; });
    const handle = {
      settled: false,
      settle: (marker) => {
        if (handle.settled) return;
        handle.settled = true;
        clearTimeout(deadline);
        if (task && task.pending === handle) task.pending = null;
        if (task == null && this._main.has(handle)) this._main.delete(handle);
        settle(marker);
      },
    };
    if (task) task.pending = handle;
    else this._main.add(handle);
    return promise;
  }

  /** Espera a que termine una tarea; `joinerId` permite cancelar a quien espera. */
  join(id, joinerId = undefined) {
    const task = this._tasks.get(id);
    if (!task) return Promise.resolve();
    if (task.state === "finished" || task.state === "failed") return Promise.resolve();
    const joiner = joinerId == null ? null : this._tasks.get(joinerId);
    return new Promise((resolve, reject) => {
      if (joiner) {
        const handle = {
          settle: (marker) => {
            const i = task.joiners.indexOf(waiter);
            if (i >= 0) task.joiners.splice(i, 1);
            if (joiner.pending === handle) joiner.pending = null;
            if (marker === MARK.cancelled) reject(new TaskCancelled());
            else resolve();
          },
        };
        var waiter = {};
        waiter.handle = handle;
        task.joiners.push(waiter);
        joiner.pending = handle;
      } else {
        const handle = {
          settle: () => {
            const i = task.joiners.indexOf(waiter);
            if (i >= 0) task.joiners.splice(i, 1);
            resolve();
          },
        };
        var waiter = { handle };
        task.joiners.push(waiter);
      }
    });
  }

  /** ¿Se pidió cancelar esta tarea? (la cancelación es persistente). */
  cancelRequested(id) {
    const task = this._tasks.get(id);
    return Boolean(task?.cancelRequested);
  }

  /** Pide cancelar una tarea: su siguiente espera se resuelve con "cancelled". */
  cancel(id) {
    const task = this._tasks.get(id);
    if (!task || task.state !== "running") return;
    task.cancelRequested = true;
    if (task.pending) {
      const p = task.pending;
      task.pending = null;
      p.settle(MARK.cancelled);
    }
  }

  /** Cancela todas las tareas y despierta al flujo principal ("Detener"). */
  interruptAll() {
    for (const task of [...this._tasks.values()]) {
      task.cancelRequested = true;
      if (task.pending) {
        const p = task.pending;
        task.pending = null;
        p.settle(MARK.cancelled);
      }
    }
    for (const handle of [...this._main]) handle.settle(MARK.stopped);
  }

  cancelAll() { this.interruptAll(); }

  /** Promesa que se resuelve cuando no queda ninguna tarea viva. */
  allSettled() {
    if (this._live() === 0) return Promise.resolve();
    return new Promise((resolve) => { this._allWaiters.push(resolve); });
  }

  /** Estado de una tarea ("scheduled" nunca aparece: spawn arranca de inmediato). */
  state(id) {
    const task = this._tasks.get(id);
    return task ? task.state : null;
  }
}

/**
 * El objeto `task` del módulo: la cara pública de JavaScript (`spawn(fn)`, `await wait(s)`).
 * También sirve de puente para Python, que llama con las firmas internas
 * `spawn(id, callable)`, `wait(id, seconds)`, `join(id, joinerId)`, `cancel(id)`,
 * `cancelAll`, `allSettled` (despachamos por el tipo del primer argumento).
 */
export class TaskProtocol {
  constructor(manager) { this._manager = manager; }

  spawn(fnOrId, maybeFn = undefined) {
    if (typeof fnOrId === "function") {
      const id = this._manager._nextId();
      // Contexto propio de la tarea: sus esperas regresan con el id, de modo que
      // cancel() (o «Detener») puede abortarlas aunque la función no complete.
      const ctx = {
        id,
        wait: async (seconds) => {
          // La cancelación es persistente: si se pidió antes, todo punto cooperativo falla.
          if (this._manager.cancelRequested(id)) throw new TaskCancelled();
          const marker = await this._manager.wait(id, checkSeconds(seconds));
          if (marker === MARK.cancelled) throw new TaskCancelled();
          if (marker === MARK.stopped) throw new TaskCancelled("program stopped");
          if (this._manager.cancelRequested(id)) throw new TaskCancelled();
          return marker === MARK.ok ? undefined : marker;
        },
      };
      this._manager.spawn(id, () => Promise.resolve().then(() => fnOrId(ctx)));
      return new Task(this._manager, id);
    }
    // Ruta del puente Python: el paquete ya trae su propio Task (excepciones en BaseException).
    return this._manager.spawn(fnOrId, maybeFn);
  }

  /** Flujo principal: devuelve el marcador ("ok"/"stopped"). Cancelable si hay tarea. */
  async wait(idOrSeconds, maybeSeconds = undefined) {
    if (maybeSeconds !== undefined) {
      return this._manager.wait(idOrSeconds, checkSeconds(maybeSeconds)).then((m) => (m === MARK.ok ? undefined : m));
    }
    return this._manager.wait(null, checkSeconds(idOrSeconds)).then((m) => (m === MARK.ok ? undefined : m));
  }

  join(id, joinerId = undefined) { return this._manager.join(id, joinerId); }
  cancel(id) { this._manager.cancel(id); }
  cancelAll() { this._manager.cancelAll(); }
  interruptAll() { return this._manager.interruptAll(); }
  allSettled() { return this._manager.allSettled(); }
  state(id) { return this._manager.state(id); }
}

export { MARK };

/** La tarea del módulo: un único planificador por aplicación (las tareas son del programa). */
export const task = new TaskProtocol(new TaskManager());
