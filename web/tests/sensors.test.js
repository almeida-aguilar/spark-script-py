import { afterEach, describe, expect, it } from "vitest";
import { BLEError, DeviceNotFoundError, OperationTimeout } from "../src/core/errors.js";
import { makeHub, sleep } from "./helpers.js";

let hub, sim;
afterEach(async () => { await hub?.disconnect(); hub = sim = undefined; });
const setup = async (devices, opts) => { ({ hub, sim } = makeHub(devices, opts)); await hub.connect(); };

describe("DistanceSensor", () => {
  it("lee 0..10, redondea half-to-even y acota", async () => {
    await setup({ A: "distance" });
    const d = hub.distanceSensor();
    sim.setDistance(7); expect(await d.read()).toBe(7);
    sim.setDistance(2.5); await sleep(0.01); expect(await d.read()).toBe(2);
    sim.setDistance(99); await sleep(0.01); expect(await d.read()).toBe(10);
    sim.setDistance(-3); await sleep(0.01); expect(await d.read()).toBe(0);
  });

  it("isNear / isFar son estrictos y validan el umbral", async () => {
    await setup({ A: "distance" });
    const d = hub.distanceSensor("A");
    sim.setDistance(5); expect(await d.read()).toBe(5);
    expect(await d.isNear(5)).toBe(false);
    expect(await d.isNear(6)).toBe(true);
    expect(await d.isFar(5)).toBe(false);
    expect(await d.isFar(4)).toBe(true);
    await expect(d.isNear(11)).rejects.toBeInstanceOf(RangeError);
    await expect(d.isNear("3")).rejects.toBeInstanceOf(TypeError);
  });

  it("solo notifica cambios: sin cambios devuelve el valor en caché", async () => {
    await setup({ A: "distance" });
    const d = hub.distanceSensor();
    sim.setDistance(4);
    expect(await d.read()).toBe(4);
    const writes = sim.writes.length;
    expect(await d.read()).toBe(4); // sin reconfigurar ni escribir
    expect(sim.writes.length).toBe(writes);
  });

  it("agota el tiempo si el hub no emite valores", async () => {
    await setup({ A: "distance" }, { silentSensors: true });
    await expect(hub.distanceSensor().read()).rejects.toBeInstanceOf(OperationTimeout);
  });

  it("falla si el dispositivo se retira mientras se lee", async () => {
    await setup({ A: "distance" }, { silentSensors: true });
    const pending = hub.distanceSensor().read();
    pending.catch(() => {});
    await sleep(0.05);
    sim.detach("A");
    await expect(pending).rejects.toBeInstanceOf(DeviceNotFoundError);
  });
});

describe("valores inválidos", () => {
  it("un escalar de longitud inesperada se informa como BLEError", async () => {
    await setup({ A: "distance" });
    const d = hub.distanceSensor();
    sim.setDistance(1);
    await d.read();
    hub._session.core._samples.set(1, Uint8Array.of(1, 2, 3)); // 3 bytes: no decodificable
    await expect(d.read()).rejects.toBeInstanceOf(BLEError);
  });

  it("un float no finito se informa como BLEError", async () => {
    await setup({ A: "distance" });
    const d = hub.distanceSensor();
    sim.setDistance(1);
    await d.read();
    hub._session.core._samples.set(1, new Uint8Array(new Float32Array([Infinity]).buffer));
    await expect(d.read()).rejects.toBeInstanceOf(BLEError);
  });
});

describe("TiltSensor", () => {
  it("lee las 5 direcciones", async () => {
    await setup({ B: "tilt" });
    const t = hub.tiltSensor();
    for (const dir of ["neutral", "back", "right", "left", "forward"]) {
      sim.setTiltDirection(dir);
      await sleep(0.01);
      expect(await t.readDirection()).toBe(dir);
    }
  });

  it("lee el ángulo como par int8 y configura UNIT_RAW", async () => {
    await setup({ B: "tilt" });
    const t = hub.tiltSensor();
    sim.setTiltAngle(-5, 10);
    expect(await t.readAngle()).toEqual([-5, 10]);
    const cfg = sim.writes.map(([, d]) => d).find((d) => d[0] === 1 && d[1] === 2 && d[2] === 2);
    expect(cfg[9]).toBe(0); // UNIT_RAW
  });

  it("cambiar de modo reconfigura el sensor", async () => {
    await setup({ B: "tilt" });
    const t = hub.tiltSensor();
    sim.setTiltAngle(3, 4); expect(await t.readAngle()).toEqual([3, 4]);
    sim.setTiltDirection("left"); await sleep(0.01);
    expect(await t.readDirection()).toBe("left");
  });

  it("filtra por longitud esperada: un valor de otra longitud agota el tiempo", async () => {
    await setup({ B: "tilt" });
    const t = hub.tiltSensor();
    sim.setTiltAngle(1, 1);
    await t.readAngle();
    hub._session.core._samples.set(2, Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9));
    await expect(t.readAngle()).rejects.toBeInstanceOf(OperationTimeout);
  });
});
