// Controlador de la aplicación: posee el Hub y el transporte, y traduce sus eventos a
// notificaciones simples para la interfaz. NO toca el DOM (la presentación vive en ui/).
import {
  Hub, HubState, SimulatedTransport, WebBluetoothTransport, isWebBluetoothSupported, makeTiming,
} from "./index.js";
import { Emitter } from "./core/util.js";

const UNSAFE_STATES = new Set([HubState.ERROR]);

export class App extends Emitter {
  constructor() {
    super();
    this.hub = null;
    this.sim = null;
    this.kind = "web-bluetooth";
    this.state = HubState.DISCONNECTED;
    this.activeMotors = new Map(); // conn -> velocidad (para la seguridad al ocultar la pestaña)
    this._unsub = null;
    this._example = null;
    this.simDevices = { A: "motor", B: "distance" };
    this.simDistance = 10;
  }

  get supportsBluetooth() { return isWebBluetoothSupported(); }
  get connected() { return this.state === HubState.CONNECTED; }
  get unsafe() { return UNSAFE_STATES.has(this.state); }

  _log(level, message) { this.emit("log", { level, message }); }

  async connect(kind, { acceptAll = false } = {}) {
    if (this.hub && this.state !== HubState.DISCONNECTED) await this.disconnect();
    this.kind = kind;
    let transport;
    let timing = null;
    if (kind === "simulated") {
      this.sim = new SimulatedTransport(this.simDevices, { externalDelay: 0.05 });
      this.sim.distance = this.simDistance ?? 10; // coherente con el control deslizante
      transport = this.sim;
      timing = makeTiming({ settleQuiet: 0.3 }); // descubrimiento más corto en el simulador
    } else {
      this.sim = null;
      transport = new WebBluetoothTransport({ acceptAll });
    }
    const hub = new Hub({ transport, timing });
    this.hub = hub;
    this.activeMotors.clear();
    this._unsub?.();
    this._unsub = hub.subscribe((type, detail) => this._onCore(type, detail));
    this._log("info", `Conectando (${kind === "simulated" ? "simulador" : "Web Bluetooth"})…`);
    try {
      await hub.connect();
    } catch (exc) {
      this._log("error", `No se pudo conectar: ${exc.message}`);
      this._setState(hub.state);
      throw exc;
    }
    this._log("info", "Conectado.");
    this.emit("hubname", { name: transport.deviceName ?? (kind === "simulated" ? "Hub simulado" : "WeDo 2.0 Smart Hub") });
    this.emit("ports", { ports: hub.ports });
    await this.refreshBattery();
  }

  async disconnect() {
    const hub = this.hub;
    if (!hub) return;
    this.stopExample();
    try {
      const confirmed = await hub.disconnect();
      this._log(confirmed ? "info" : "warn", confirmed ? "Desconectado." : "Desconectado, pero la parada de motores no pudo confirmarse.");
    } catch (exc) {
      this._log("error", `Error al desconectar: ${exc.message}`);
    }
    this.activeMotors.clear();
    this._setState(hub.state);
    this.emit("ports", { ports: {} });
  }

  async refreshBattery() {
    if (!this.connected) return;
    try {
      this.emit("battery", { percent: await this.hub.readBattery() });
    } catch (exc) { this._log("warn", `Batería: ${exc.message}`); }
  }

  /** Ejecuta una acción del hub registrando los errores en la consola en vez de lanzarlos. */
  async run(label, fn) {
    try {
      const result = await fn(this.hub);
      this._log("op", label);
      return result;
    } catch (exc) {
      this._log("error", `${label}: ${exc.message}`);
      return undefined;
    }
  }

  async emergencyStop() {
    if (!this.hub) return;
    this._log("warn", "Parada de emergencia solicitada.");
    try { await this.hub.tasks.cancel(); } catch { /* mejor esfuerzo */ }
    try { await this.hub.stopAll(); } catch (exc) { this._log("error", `Parada: ${exc.message}`); }
  }

  /** Al ocultar la pestaña los temporizadores pueden retrasarse: se paran los motores. */
  async onHidden() {
    if (this.connected && [...this.activeMotors.values()].some((s) => s !== 0)) {
      this._log("warn", "La pestaña se ocultó con motores en marcha: se envía parada (los temporizadores del navegador pueden retrasarse).");
      await this.emergencyStop();
    }
  }

  // -- ejemplos (usan la API pública) ---------------------------------------------

  startExample(name) {
    const hub = this.hub;
    if (!hub || !this.connected || this._example) return;
    const ports = hub.ports;
    const motorPort = Object.keys(ports).find((p) => ports[p] === "motor");
    const distPort = Object.keys(ports).find((p) => ports[p] === "distance");
    const sleepLed = async (ctx) => {
      for (;;) {
        await hub.led.rgb(0, 255, 64); await ctx.sleep(0.4);
        await hub.led.off(); await ctx.sleep(0.4);
      }
    };
    if (name === "blink") {
      if (!motorPort) { this._log("warn", "Este ejemplo necesita un motor en el puerto A o B."); return; }
      hub.tasks.add(sleepLed, { background: true });
      hub.tasks.add(async (ctx) => {
        const motor = hub.motor(motorPort);
        try {
          await motor.run(50); await ctx.sleep(1.5);
          await motor.run(-50); await ctx.sleep(1.5);
        } finally { await motor.stop(); }
      });
    } else if (name === "avoid") {
      if (!motorPort || !distPort) { this._log("warn", "Este ejemplo necesita un motor y un sensor de distancia."); return; }
      hub.tasks.add(async (ctx) => {
        const motor = hub.motor(motorPort);
        const dist = hub.distanceSensor(distPort);
        try {
          for (;;) {
            const d = await dist.read();
            await motor.run(d < 4 ? -40 : 40); // retrocede si hay un obstáculo cerca
            await ctx.sleep(0.15);
          }
        } finally { await motor.stop(); }
      });
    }
    this._log("info", `Ejemplo «${name}» en marcha.`);
    this.emit("example", { running: true });
    this._example = hub.tasks.wait()
      .catch((exc) => this._log("error", `Ejemplo: ${exc.message}`))
      .finally(() => { this._example = null; this._log("info", "Ejemplo terminado."); this.emit("example", { running: false }); });
  }

  stopExample() {
    if (this._example && this.hub) this.hub.tasks.cancel();
  }

  // -- eventos del núcleo -----------------------------------------------------------

  _setState(state) {
    if (state === this.state) return;
    this.state = state;
    this.emit("state", { state, unsafe: this.unsafe });
  }

  _onCore(type, d) {
    switch (type) {
      case "state":
        this._setState(d.state);
        this._log(d.state === HubState.ERROR ? "error" : "info", `Estado: ${d.state}${d.error ? ` (${d.error})` : ""}`);
        break;
      case "ports": this.emit("ports", { ports: this.hub.ports }); break;
      case "motor":
        this.activeMotors.set(d.conn, d.speed);
        this.emit("motor", d);
        break;
      case "button": this.emit("button", d); break;
      case "log": if (d.level !== "debug") this._log(d.level, d.message); break;
      default: break;
    }
  }
}
