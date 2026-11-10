// Ciclo de vida de una sesión de hub: coordinador, gestor de tareas y registro de cierre.
import { Coordinator } from "../core/coordinator.js";
import { HubState } from "../core/state-machine.js";
import { InvalidStateError } from "../core/errors.js";
import { WebBluetoothTransport } from "../transport/web-bluetooth.js";
import { TaskManager } from "./tasks.js";

// Equivalente al Supervisor de Python (atexit): al cerrar/ocultar la página se intenta,
// como mejor esfuerzo, parar los motores. Un navegador puede no dejar completar la escritura.
const sessions = new Set();
let hooked = false;
function hookPageLifecycle() {
  if (hooked || typeof globalThis.addEventListener !== "function") return;
  hooked = true;
  globalThis.addEventListener("pagehide", () => {
    for (const s of sessions) s.emergencyClose().catch(() => {});
  });
}

export class Session {
  constructor(transport = null, timing = null) {
    this._transport = transport;
    this._timing = timing;
    this._core = null;
    this.tasks = new TaskManager({ onInterrupt: () => this._interrupted() });
  }

  /** El coordinador. Lanza si el hub nunca se conectó. */
  get core() {
    if (!this._core) throw new InvalidStateError("hub is not connected; call connect() first");
    return this._core;
  }

  get isConnected() {
    return this._core !== null && this._core.state === HubState.CONNECTED;
  }

  /** Crea el coordinador si hace falta (permite suscribirse a eventos antes de conectar). */
  ensureCore() {
    if (!this._core) {
      this._core = new Coordinator(this._transport ?? new WebBluetoothTransport(), this._timing);
    }
    return this._core;
  }

  async connect() {
    await this.ensureCore().connect();
    sessions.add(this);
    hookPageLifecycle();
  }

  /** Cancela las tareas primero (para que ninguna ordene un motor tras la parada), luego para motores y cierra. */
  async disconnect() {
    await this.tasks.cancel();
    let confirmed = true;
    if (this._core) confirmed = await this._core.disconnect();
    sessions.delete(this);
    return confirmed;
  }

  async shutdown() {
    await this.tasks.cancel();
    const core = this.core;
    try { await core.stopAll(); } catch (exc) {
      core._log("warn", `could not stop motors before shutdown: ${exc?.message}`);
    }
    await core.shutdownHub();
    sessions.delete(this);
  }

  stopAll() { return this.core.stopAll(); }
  portsRaw() { return this._core ? this._core.portsRaw() : new Map(); }
  refreshPorts() { return this.core.refreshPorts(); }

  /** Cierre de emergencia (pagehide). Mejor esfuerzo, nunca lanza. */
  async emergencyClose() {
    try {
      await this.tasks.cancel();
      if (this._core) await this._core.disconnect();
    } catch { /* nunca propaga */ }
  }

  async _interrupted() {
    if (this.isConnected) {
      try { await this._core.stopAll(); } catch (exc) {
        this._core._log("warn", `could not stop motors after interrupt: ${exc?.message}`);
      }
    }
  }
}
