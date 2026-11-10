// Runtime de Python (Pyodide) para el editor. Ejecuta programas escritos para la biblioteca
// Python `wedopy` sobre el hub conectado en la aplicación, mediante un puente síncrono
// (JSPI: `pyodide.ffi.run_sync`). Requiere un navegador con JSPI (Chrome/Edge >= 137).
import { UnsupportedFeatureError } from "../core/errors.js";

const PY_FILES = import.meta.glob("./wedo/*.py", { query: "?raw", import: "default", eager: true });

// «Detener» NO rechaza ninguna promesa: los sleep despiertan antes de tiempo con una
// resolución normal y es _bridge.wait quien, tras volver de run_sync (la frontera JSPI ya
// deshecha), lanza KeyboardInterrupt con check_stop(). Lanzar excepciones a través de la
// frontera deja continuaciones huérfanas en Pyodide (promesas sin capturar).

const BOOTSTRAP = `
import time
from wedo import _bridge
time.sleep = _bridge.sleep   # sleep cooperativo: cede a la página y admite «Detener»
`;

export class PythonRuntime {
  /**
   * @param {object} o
   * @param {() => object|null} o.getHub        hub JS conectado (o null)
   * @param {(stream: "stdout"|"stderr", text: string) => void} [o.onOutput]
   * @param {() => Promise<{loadPyodide: Function}>} o.loader   importa Pyodide
   * @param {string} [o.indexURL]               ubicación de los ficheros de Pyodide
   */
  constructor({ getHub, onOutput = () => {}, loader, indexURL }) {
    this._getHub = getHub;
    this._out = onOutput;
    this._loader = loader;
    this._indexURL = indexURL;
    this.py = null;
    this._loading = null;
    this._stop = false;
    this._running = false;
    this._sleepers = new Set();
    this._current = null;
  }

  get running() { return this._running; }
  get ready() { return this.py !== null; }

  /** Carga Pyodide e instala el paquete `wedopy` (una sola vez). */
  init(onStatus = () => {}) {
    this._loading ??= this._init(onStatus).catch((e) => { this._loading = null; throw e; });
    return this._loading;
  }

  async _init(onStatus) {
    onStatus("Cargando Python (solo la primera vez)…");
    const { loadPyodide } = await this._loader();
    const py = await loadPyodide(this._indexURL ? { indexURL: this._indexURL } : {});
    // can_run_sync() solo es fiable dentro de un contexto asíncrono (runPythonAsync).
    const jspi = await py.runPythonAsync("from pyodide.ffi import can_run_sync\ncan_run_sync()");
    if (!jspi) {
      throw new UnsupportedFeatureError(
        "Este navegador no admite JSPI (WebAssembly JavaScript Promise Integration), necesario para ejecutar "
        + "programas Python síncronos. Usa Chrome o Edge 137 o posterior.");
    }
    py.setStdout({ batched: (s) => this._out("stdout", s) });
    py.setStderr({ batched: (s) => this._out("stderr", s) });
    py.FS.mkdirTree("/home/pyodide/wedo");
    for (const [path, source] of Object.entries(PY_FILES)) {
      py.FS.writeFile(`/home/pyodide/wedo/${path.split("/").pop()}`, source);
    }
    // «Detener» despierta los sleep antes de tiempo (resolución normal, sin rechazar):
    // _bridge.wait detecta la bandera al volver de run_sync y lanza KeyboardInterrupt.
    globalThis.wedoBridge = {
      getHub: () => this._getHub() ?? undefined,
      // Un solo disparo, como Ctrl+C: la limpieza del programa (finally) puede llamar al hub.
      stopRequested: () => { const requested = this._stop; this._stop = false; return requested; },
      sleep: (seconds) => new Promise((resolve) => {
        const done = () => { clearTimeout(timer); this._sleepers.delete(done); resolve(); };
        const timer = setTimeout(done, seconds * 1000);
        this._sleepers.add(done);
        if (this._stop) done(); // «Detener» llegó antes del temporizador
      }),
    };
    // «Detener» lanza KeyboardInterrupt al nivel superior de runPythonAsync; al escapar por el
    // canal de handles del webloop creaba un PythonError huérfano como rechazo de promesa sin
    // capturar. Este es el canal oficial del webloop (lo usa su consola): absorbe la interrupción
    // a nivel de handle; el resultado del programa sigue llegando por la promesa del propio
    // runPythonAsync, que consume _execute.
    await py.runPythonAsync(
      "import asyncio\nasyncio.get_event_loop()._keyboard_interrupt_handler = lambda: None",
    );
    await py.runPythonAsync(BOOTSTRAP);
    this.py = py;
    onStatus("Python listo.");
    return py;
  }

  /**
   * Ejecuta un programa. Devuelve `{ ok, stopped, error }`; nunca lanza por errores del programa.
   * Solo puede haber un script a la vez: si ya hay uno en marcha, se interrumpe (igual que con
   * el botón «Detener»), se espera a que termine su limpieza (parada de motores incluida) y
   * después arranca el nuevo, al estilo del editor de micro:bit.
   */
  async run(code) {
    if (this._running) {
      this.stop();
      try { await this._current; } catch { /* el error ya se notificó en su salida */ }
      this._stop = false;
    }
    await this.init();
    // Carrera de dos lanzamientos casi simultáneos: tras la inicialización se re-comprueba.
    if (this._running) {
      this.stop();
      try { await this._current; } catch { /* ya notificado */ }
      this._stop = false;
    }
    this._running = true;
    this._stop = false;
    this._current = this._execute(code);
    return this._current;
  }

  async _execute(code) {
    const globals = this.py.globals.get("dict")();
    try {
      await this.py.runPythonAsync(code, { globals });
      return { ok: true, stopped: false, error: null };
    } catch (exc) {
      if (exc?.type === "KeyboardInterrupt") return { ok: false, stopped: true, error: null };
      const text = exc?.message ?? String(exc);
      this._out("stderr", text.endsWith("\n") ? text : `${text}\n`);
      return { ok: false, stopped: false, error: text };
    } finally {
      this._running = false;
      globals.destroy();
      // Equivale al Supervisor de Python al terminar el programa: no dejar motores en marcha.
      const hub = this._getHub();
      if (hub?.isConnected) { try { await hub.stopAll(); } catch { /* mejor esfuerzo */ } }
    }
  }

  /** Detiene el programa: los sleep despiertan antes de tiempo (→ KeyboardInterrupt en
   * _bridge.wait) y la siguiente llamada al hub lanza KeyboardInterrupt igualmente. */
  stop() {
    if (!this._running) return;
    this._stop = true;
    for (const wake of [...this._sleepers]) wake();
    // Aborta los puntos de suspensión cooperativos: las esperas de tareas se resuelven
    // con marcador "cancelled" (Python lanza TaskCancelled y corre sus finally) y las
    // del flujo principal con "stopped" (KeyboardInterrupt). Nunca se rechaza nada:
    // un rechazo a través de run_sync deja continuaciones de pila huérfanas en Pyodide.
    try { this._getHub()?.task?.interruptAll?.(); } catch { /* mejor esfuerzo */ }
  }
}

/** Carga Pyodide servido junto a la aplicación (public/pyodide/, copiado por scripts/copy-pyodide.mjs). */
export function browserLoader(base = import.meta.env.BASE_URL) {
  const indexURL = `${new URL(`${base}pyodide/`, globalThis.location.href).href}`;
  return {
    indexURL,
    loader: () => import(/* @vite-ignore */ `${indexURL}pyodide.mjs`),
  };
}
