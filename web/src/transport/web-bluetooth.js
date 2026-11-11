// Transporte real sobre la Web Bluetooth API (Chrome/Edge, contexto seguro HTTPS).
//
// ESTADO: implementado a partir del contrato y de la especificación del protocolo de la
// biblioteca Python. NO está validado contra un Smart Hub físico (el propio BleakTransport
// original tampoco lo estaba en el momento de este port). Ver docs/web-migracion.md.
//
// Notas de diseño:
//  * requestDevice() exige un gesto del usuario: connect() debe originarse en un clic.
//    No hay reconexión automática.
//  * Todas las escrituras son writeValueWithResponse. Si el navegador no lo ofrece se lanza
//    UnsupportedFeatureError en lugar de degradar a escritura sin respuesta (el ACK es lo que
//    el watchdog necesita).
//  * Web Bluetooth no permite cancelar una operación GATT: al vencer el `timeout` se rechaza
//    la promesa, pero la operación subyacente puede completarse más tarde.
//  * El `timeout` de connect() cubre la conexión GATT y el descubrimiento, no el selector.
import * as K from "../core/constants.js";
import {
  BLEError, HubConnectionError, HubDisconnectedError, UnsupportedFeatureError, WedoError,
} from "../core/errors.js";
import { timeoutError, withTimeout } from "../core/util.js";
import { Transport } from "./interfaces.js";

const SERVICES = [K.SERVICE_HUB, K.SERVICE_IO, K.SERVICE_BATTERY, K.SERVICE_DEVICE_INFO];

export function isWebBluetoothSupported(nav = globalThis.navigator) {
  return Boolean(nav && nav.bluetooth && typeof nav.bluetooth.requestDevice === "function");
}

/** Explica por qué Web Bluetooth no está disponible (o null si lo está). */
export function webBluetoothProblem(env = globalThis) {
  if (isWebBluetoothSupported(env.navigator)) return null;
  if (env.isSecureContext === false) {
    return "Web Bluetooth requiere HTTPS (o localhost). Abre la aplicación desde una dirección segura.";
  }
  const ua = env.navigator?.userAgent ?? "";
  const linux = /Linux/.test(ua) && !/Android/.test(ua);
  const hint = linux
    ? " En Linux Web Bluetooth está desactivado por defecto: abre chrome://flags/#enable-experimental-web-platform-features, "
      + "ponlo en «Enabled», reinicia el navegador y comprueba que BlueZ ≥ 5.41 (`bluetoothd --version`) y el servicio bluetooth están activos."
    : "";
  return "Este navegador no admite Web Bluetooth. Usa Chrome o Edge en un sistema compatible "
    + `(Firefox y Safari no están soportados).${hint}`;
}

const toBytes = (dv) => new Uint8Array(dv.buffer.slice(dv.byteOffset, dv.byteOffset + dv.byteLength));

export class WebBluetoothTransport extends Transport {
  interactive = true;

  /** @param {{bluetooth?: Bluetooth}} [opts] `bluetooth` permite inyectar un doble en pruebas. */
  constructor({ bluetooth = globalThis.navigator?.bluetooth, acceptAll = false } = {}) {
    super();
    this._bt = bluetooth;
    this._acceptAll = acceptAll; // muestra todos los dispositivos BLE (diagnóstico de filtros)
    this._device = null;
    this._chars = new Map(); // uuid -> BluetoothRemoteGATTCharacteristic
    this._handlers = new Map(); // uuid -> listener characteristicvaluechanged
    this._onNotify = null;
    this._onDisconnect = null;
    this._closing = false;
    this._onGattDisconnected = () => {
      if (this._closing) return;
      this._onDisconnect?.("BLE link lost");
    };
  }

  setCallbacks(onNotify, onDisconnect) {
    this._onNotify = onNotify;
    this._onDisconnect = onDisconnect;
  }

  get deviceName() { return this._device?.name ?? null; }

  async connect(timeout) {
    if (!this._bt) throw new UnsupportedFeatureError(webBluetoothProblem() ?? "Web Bluetooth no está disponible");
    this._closing = false;
    let device;
    try {
      device = await this._bt.requestDevice(this._acceptAll
        ? { acceptAllDevices: true, optionalServices: SERVICES }
        : {
          filters: [
            { services: [K.SERVICE_HUB] },
            ...K.WEDO_NAMES.map((name) => ({ name })),
          ],
          optionalServices: SERVICES,
        });
    } catch (exc) {
      if (exc?.name === "NotFoundError") throw new HubConnectionError("no WeDo 2.0 hub was selected");
      if (exc?.name === "SecurityError") {
        throw new HubConnectionError("the browser requires a user gesture (click) and HTTPS to open the Bluetooth chooser");
      }
      throw new BLEError(exc?.message ?? String(exc), { cause: exc });
    }
    this._device = device;
    device.addEventListener("gattserverdisconnected", this._onGattDisconnected);
    try {
      const server = await withTimeout(device.gatt.connect(), timeout, timeoutError("GATT connect", timeout));
      await withTimeout(this._discover(server), timeout, timeoutError("service discovery", timeout));
    } catch (exc) {
      await this._release();
      throw this._map(exc);
    }
  }

  async _discover(server) {
    this._chars.clear();
    for (const uuid of SERVICES) {
      let service;
      try {
        service = await server.getPrimaryService(uuid);
      } catch (exc) {
        if (exc?.name === "NotFoundError") continue; // servicio opcional ausente
        throw exc;
      }
      for (const c of await service.getCharacteristics()) this._chars.set(c.uuid.toLowerCase(), c);
    }
  }

  async disconnect() {
    this._closing = true;
    await this._release();
  }

  async _release() {
    const device = this._device;
    this._device = null;
    for (const [uuid, handler] of this._handlers) this._chars.get(uuid)?.removeEventListener("characteristicvaluechanged", handler);
    this._handlers.clear();
    this._chars.clear();
    if (device) {
      device.removeEventListener("gattserverdisconnected", this._onGattDisconnected);
      try { if (device.gatt?.connected) device.gatt.disconnect(); } catch { /* ya desconectado */ }
    }
  }

  hasCharacteristic(uuid) { return this._chars.has(uuid); }

  _char(uuid) {
    if (!this._device?.gatt?.connected) throw new HubDisconnectedError("BLE link is not open");
    const c = this._chars.get(uuid);
    if (!c) throw new BLEError(`characteristic not available: ${uuid}`);
    return c;
  }

  /** Traduce errores del navegador a la jerarquía de wedo. */
  _map(exc) {
    if (exc instanceof WedoError) return exc;
    if (!this._device?.gatt?.connected || exc?.name === "NetworkError") {
      return new HubDisconnectedError(exc?.message || "BLE link lost", { cause: exc });
    }
    return new BLEError(exc?.message || exc?.name || "BLE error", { cause: exc });
  }

  async _run(promise, timeout, what) {
    try {
      return await withTimeout(promise, timeout, timeoutError(what, timeout));
    } catch (exc) {
      throw this._map(exc);
    }
  }

  async read(uuid, timeout) {
    const c = this._char(uuid);
    return toBytes(await this._run(c.readValue(), timeout, "BLE read"));
  }

  async write(uuid, data, timeout) {
    const c = this._char(uuid);
    // Siempre con respuesta: el ACK es lo que el watchdog necesita.
    if (typeof c.writeValueWithResponse !== "function") {
      throw new UnsupportedFeatureError("this browser lacks writeValueWithResponse; refusing to write without response");
    }
    await this._run(c.writeValueWithResponse(Uint8Array.from(data)), timeout, "BLE write");
  }

  async subscribe(uuid, timeout) {
    const c = this._char(uuid);
    if (!this._handlers.has(uuid)) {
      const handler = (event) => {
        const value = event.target?.value;
        if (value) this._onNotify?.(uuid, toBytes(value));
      };
      c.addEventListener("characteristicvaluechanged", handler);
      this._handlers.set(uuid, handler);
    }
    await this._run(c.startNotifications(), timeout, "BLE start notifications");
  }

  async unsubscribe(uuid, timeout) {
    const c = this._char(uuid);
    await this._run(c.stopNotifications(), timeout, "BLE stop notifications");
    const handler = this._handlers.get(uuid);
    if (handler) { c.removeEventListener("characteristicvaluechanged", handler); this._handlers.delete(uuid); }
  }
}
