// Heartbeat + supervisión de tiempo, independiente del planificador de tareas del usuario.
//
// El heartbeat es una lectura de la característica Battery con respuesta, encolada con
// prioridad de emergencia para que una cola larga de órdenes normales no la retrase.
//
// LIMITACIÓN DEL NAVEGADOR: este bucle usa temporizadores (setTimeout). Una pestaña en
// segundo plano puede recibir temporizadores retrasados (>=1 s, o 1 min con "intensive
// throttling"), de modo que NO es una garantía absoluta de parada. Ver docs/web-seguridad.md.
import { Signal, now as defaultNow } from "./util.js";

export class Watchdog {
  /**
   * @param {object} o
   * @param {object} o.timing
   * @param {() => boolean} o.isArmed           true si hay enlace y algún motor activo
   * @param {() => {settled: boolean}} o.enqueueHeartbeat  encola la lectura de batería (emergencia)
   * @param {() => number} o.lastOk              instante (s) del último ACK válido
   * @param {(reason: string) => Promise<void>} o.trip      parada de emergencia
   * @param {() => number} [o.now]
   */
  constructor({ timing, isArmed, enqueueHeartbeat, lastOk, trip, now = defaultNow }) {
    this._tm = timing;
    this._isArmed = isArmed;
    this._enqueueHeartbeat = enqueueHeartbeat;
    this._lastOk = lastOk;
    this._trip = trip;
    this._now = now;
    this._signal = new Signal();
    this._stopped = true;
    this._loop = null;
  }

  start() {
    this._stopped = false;
    this._loop = this._run();
  }

  /** Despierta el bucle (p. ej. al ordenar un motor) y espera a que termine el bucle al parar. */
  wake() { this._signal.notify(); }

  async stop() {
    this._stopped = true;
    this._signal.notify();
    const loop = this._loop;
    this._loop = null;
    if (loop) await loop;
  }

  async _run() {
    const tm = this._tm;
    let hb = null;
    let nextHb = 0;
    while (!this._stopped) {
      if (!this._isArmed()) {
        hb = null;
        await this._signal.wait(0.1);
        continue;
      }
      const t = this._now();
      if (hb && hb.settled) hb = null;
      if (hb === null && t >= nextHb) {
        nextHb = t + tm.heartbeatInterval;
        try { hb = this._enqueueHeartbeat(); } catch { hb = null; }
      }
      const silent = t - this._lastOk();
      if (silent > tm.watchdogTimeout) {
        await this._trip(`no valid ACK from the hub for ${silent.toFixed(1)} s`);
        hb = null;
        continue;
      }
      await this._signal.wait(tm.poll);
    }
  }
}
