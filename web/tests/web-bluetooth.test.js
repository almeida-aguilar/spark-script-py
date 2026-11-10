// Pruebas UNITARIAS del adaptador Web Bluetooth con un doble de la API del navegador.
// No sustituyen a las pruebas con un Smart Hub real (criterio AC-02 sigue pendiente).
import { describe, expect, it } from "vitest";
import * as K from "../src/core/constants.js";
import { Hub } from "../src/api/hub.js";
import {
  BLEError, HubConnectionError, HubDisconnectedError, UnsupportedFeatureError,
} from "../src/core/errors.js";
import {
  WebBluetoothTransport, isWebBluetoothSupported, webBluetoothProblem,
} from "../src/transport/web-bluetooth.js";
import { attachEvent } from "../src/transport/simulated.js";
import { FAST, waitFor } from "./helpers.js";

class FakeChar extends EventTarget {
  constructor(uuid, { value = [0], writeWithResponse = true } = {}) {
    super();
    this.uuid = uuid; this._value = value; this.writes = []; this.notifying = false;
    if (writeWithResponse) this.writeValueWithResponse = async (d) => { this.writes.push(Uint8Array.from(d)); };
  }
  async readValue() { return new DataView(Uint8Array.from(this._value).buffer); }
  async startNotifications() { this.notifying = true; if (this.onStart) this.onStart(); }
  async stopNotifications() { this.notifying = false; }
  push(bytes) {
    const ev = new Event("characteristicvaluechanged");
    Object.defineProperty(ev, "target", { value: { value: new DataView(Uint8Array.from(bytes).buffer) } });
    this.dispatchEvent(ev);
  }
}

function fakeBluetooth({ writeWithResponse = true, reject } = {}) {
  const chars = new Map([
    [K.CHAR_BATTERY, new FakeChar(K.CHAR_BATTERY, { value: [91], writeWithResponse })],
    [K.CHAR_PORT, new FakeChar(K.CHAR_PORT, { writeWithResponse })],
    [K.CHAR_SENSOR, new FakeChar(K.CHAR_SENSOR, { writeWithResponse })],
    [K.CHAR_BUTTON, new FakeChar(K.CHAR_BUTTON, { writeWithResponse })],
    [K.CHAR_INPUT_CMD, new FakeChar(K.CHAR_INPUT_CMD, { writeWithResponse })],
    [K.CHAR_OUTPUT_CMD, new FakeChar(K.CHAR_OUTPUT_CMD, { writeWithResponse })],
    [K.CHAR_TURN_OFF, new FakeChar(K.CHAR_TURN_OFF, { writeWithResponse })],
  ]);
  const byService = {
    [K.SERVICE_HUB]: [K.CHAR_BUTTON, K.CHAR_PORT, K.CHAR_TURN_OFF],
    [K.SERVICE_IO]: [K.CHAR_SENSOR, K.CHAR_INPUT_CMD, K.CHAR_OUTPUT_CMD],
    [K.SERVICE_BATTERY]: [K.CHAR_BATTERY],
  };
  chars.get(K.CHAR_PORT).onStart = () => {
    setTimeout(() => {
      chars.get(K.CHAR_PORT).push(attachEvent(K.CONN_RGB, K.TYPE_RGB));
      chars.get(K.CHAR_PORT).push(attachEvent(K.CONN_PORT_A, K.TYPE_MOTOR));
    }, 10);
  };
  const device = Object.assign(new EventTarget(), {
    name: "LPF2 Smart Hub 2 I/O",
    gatt: {
      connected: false,
      async connect() { this.connected = true; return this; },
      disconnect() { this.connected = false; },
      async getPrimaryService(uuid) {
        if (!byService[uuid]) { const e = new Error("no service"); e.name = "NotFoundError"; throw e; }
        return { getCharacteristics: async () => byService[uuid].map((u) => chars.get(u)) };
      },
    },
  });
  const requests = [];
  const bluetooth = {
    requestDevice: async (opts) => {
      requests.push(opts);
      if (reject) { const e = new Error("cancelled"); e.name = reject; throw e; }
      return device;
    },
  };
  return { bluetooth, device, chars, requests };
}

describe("detección de compatibilidad", () => {
  it("detecta navigator.bluetooth y explica su ausencia", () => {
    expect(isWebBluetoothSupported({ bluetooth: { requestDevice() {} } })).toBe(true);
    expect(isWebBluetoothSupported({})).toBe(false);
    expect(isWebBluetoothSupported(undefined)).toBe(false);
    expect(webBluetoothProblem({ navigator: {}, isSecureContext: false })).toMatch(/HTTPS/);
    expect(webBluetoothProblem({ navigator: {}, isSecureContext: true })).toMatch(/Chrome o Edge/);
    expect(webBluetoothProblem({ navigator: { bluetooth: { requestDevice() {} } } })).toBeNull();
  });

  it("lanza UnsupportedFeatureError sin Web Bluetooth", async () => {
    const t = new WebBluetoothTransport({ bluetooth: undefined });
    await expect(t.connect(1)).rejects.toBeInstanceOf(UnsupportedFeatureError);
  });
});

describe("WebBluetoothTransport (doble del navegador)", () => {
  it("filtra por el servicio y el nombre del hub y declara los servicios opcionales", async () => {
    const f = fakeBluetooth();
    const t = new WebBluetoothTransport({ bluetooth: f.bluetooth });
    await t.connect(1);
    const { filters, optionalServices } = f.requests[0];
    expect(filters).toContainEqual({ services: [K.SERVICE_HUB] });
    expect(filters).toContainEqual({ name: "LPF2 Smart Hub 2 I/O" });
    expect(optionalServices).toEqual(expect.arrayContaining([K.SERVICE_HUB, K.SERVICE_IO, K.SERVICE_BATTERY]));
    for (const u of K.REQUIRED_CHARS) expect(t.hasCharacteristic(u)).toBe(true);
    await t.disconnect();
    expect(f.device.gatt.connected).toBe(false);
  });

  it("traduce la cancelación del selector a HubConnectionError", async () => {
    const f = fakeBluetooth({ reject: "NotFoundError" });
    const t = new WebBluetoothTransport({ bluetooth: f.bluetooth });
    await expect(t.connect(1)).rejects.toBeInstanceOf(HubConnectionError);
  });

  it("traduce SecurityError (sin gesto de usuario) a HubConnectionError", async () => {
    const f = fakeBluetooth({ reject: "SecurityError" });
    const t = new WebBluetoothTransport({ bluetooth: f.bluetooth });
    await expect(t.connect(1)).rejects.toThrow(/user gesture/);
  });

  it("se niega a escribir sin respuesta", async () => {
    const f = fakeBluetooth({ writeWithResponse: false });
    const t = new WebBluetoothTransport({ bluetooth: f.bluetooth });
    await t.connect(1);
    await expect(t.write(K.CHAR_OUTPUT_CMD, Uint8Array.of(1), 1)).rejects.toBeInstanceOf(UnsupportedFeatureError);
  });

  it("detecta la pérdida de enlace y la distingue de una desconexión pedida", async () => {
    const f = fakeBluetooth();
    const t = new WebBluetoothTransport({ bluetooth: f.bluetooth });
    const reasons = [];
    t.setCallbacks(() => {}, (r) => reasons.push(r));
    await t.connect(1);
    f.device.gatt.connected = false;
    f.device.dispatchEvent(new Event("gattserverdisconnected"));
    expect(reasons).toEqual(["BLE link lost"]);
    await expect(t.read(K.CHAR_BATTERY, 1)).rejects.toBeInstanceOf(HubDisconnectedError);
    const f2 = fakeBluetooth();
    const t2 = new WebBluetoothTransport({ bluetooth: f2.bluetooth });
    const r2 = []; t2.setCallbacks(() => {}, (r) => r2.push(r));
    await t2.connect(1);
    await t2.disconnect();
    f2.device.dispatchEvent(new Event("gattserverdisconnected"));
    expect(r2).toEqual([]);
  });

  it("mapea errores GATT genéricos a BLEError", async () => {
    const f = fakeBluetooth();
    const t = new WebBluetoothTransport({ bluetooth: f.bluetooth });
    await t.connect(1);
    f.chars.get(K.CHAR_BATTERY).readValue = async () => { throw new Error("gatt error"); };
    await expect(t.read(K.CHAR_BATTERY, 1)).rejects.toBeInstanceOf(BLEError);
  });

  it("funciona de extremo a extremo con la API Hub sobre el doble", async () => {
    const f = fakeBluetooth();
    const hub = new Hub({ transport: new WebBluetoothTransport({ bluetooth: f.bluetooth }), timing: FAST });
    await hub.connect();
    expect(hub.ports).toEqual({ A: "motor" });
    expect(await hub.readBattery()).toBe(91);
    await hub.motor("A").run(-50);
    expect(f.chars.get(K.CHAR_OUTPUT_CMD).writes.at(-1)).toEqual(Uint8Array.of(1, 1, 1, 0xce));
    f.chars.get(K.CHAR_BUTTON).push([1]);
    expect(await waitFor(() => hub.button.isPressed)).toBe(true);
    await hub.disconnect();
    expect(f.chars.get(K.CHAR_OUTPUT_CMD).writes.at(-1)).toEqual(Uint8Array.of(1, 1, 1, 0)); // parada al desconectar
    expect(f.device.gatt.connected).toBe(false);
  });
});
