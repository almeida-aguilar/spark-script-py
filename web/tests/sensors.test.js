import { afterEach, describe, expect, it } from "vitest";
import * as K from "../src/core/constants.js";
import { BLEError, NoReadingError, PortError } from "../src/core/errors.js";
import { inputFormat } from "../src/core/protocol.js";
import { makeHub, sleep } from "./helpers.js";

let hub, sim;
afterEach(async () => { await hub?.disconnect(); hub = sim = undefined; });
const setup = async (devices, opts) => { ({ hub, sim } = makeHub(devices, opts)); hub.connect(); await hub.waitConnection(5); };

describe("DistanceSensor", () => {
  it("lee 0..10 como centímetros enteros", async () => {
    await setup({ A: "distance" });
    const d = hub.distance("A");
    sim.setDistance(7); expect(await d.read()).toBe(7);
    sim.setDistance(2.5); await sleep(0.01); expect(await d.read()).toBe(3);
    sim.setDistance(99); await sleep(0.01); expect(await d.read()).toBe(10);
    sim.setDistance(-3); await sleep(0.01); expect(await d.read()).toBe(0);
  });

  it("detecta los cambios y los consume una sola vez", async () => {
    await setup({ A: "distance" });
    const d = hub.distance("A");
    sim.setDistance(4);
    await d.read();                    // el primer valor es el estado de partida
    expect(d.hasChange()).toBe(false);
    sim.setDistance(7); await sleep(0.05);
    expect(d.hasChange("increase")).toBe(true);
    expect(d.hasChange("increase")).toBe(false); // consumido
    sim.setDistance(2); await sleep(0.05);
    expect(d.hasChange("decrease")).toBe(true);
    expect(d.hasChange("increase")).toBe(false);
  });

  it("un filtro no admitido es un error", async () => {
    await setup({ A: "distance" });
    expect(() => hub.distance("A").hasChange("increasex")).toThrow(RangeError);
  });

  it("espera un cambio y devuelve su tipo", async () => {
    await setup({ A: "distance" });
    const d = hub.distance("A");
    sim.setDistance(2);
    await d.read();
    const pending = d.waitChange("increase");
    await sleep(0.05);
    sim.setDistance(8);
    await expect(pending).resolves.toBe("increase");
  });

  it("solo notifica cambios: sin cambios devuelve el valor en caché", async () => {
    await setup({ A: "distance" });
    const d = hub.distance("A");
    sim.setDistance(4);
    expect(await d.read()).toBe(4);
    const writes = sim.writes.length;
    expect(await d.read()).toBe(4);
    expect(sim.writes.length).toBe(writes);
  });

  it("sin lectura todavía, lanza NoReadingError", async () => {
    await setup({ A: "distance" }, { silentSensors: true });
    await expect(hub.distance("A").read()).rejects.toBeInstanceOf(NoReadingError);
  });

  it("falla si el dispositivo se retira mientras se lee", async () => {
    await setup({ A: "distance" }, { silentSensors: true });
    const pending = hub.distance("A").read();
    pending.catch(() => {});
    await sleep(0.05);
    sim.detach("A");
    await expect(pending).rejects.toBeInstanceOf(PortError);
  });
});

describe("valores inválidos", () => {
  it("un escalar de longitud inesperada se informa como BLEError", async () => {
    await setup({ A: "distance" });
    const d = hub.distance("A");
    sim.setDistance(1);
    await d.read();
    hub._session.core._samples.set(1, Uint8Array.of(1, 2, 3));
    await expect(d.read()).rejects.toBeInstanceOf(BLEError);
  });
});

describe("TiltSensor", () => {
  it("lee la dirección con los nombres de la API", async () => {
    await setup({ B: "tilt" });
    const t = hub.tilt("B");
    for (const dir of ["none", "backward", "left", "right", "forward"]) {
      sim.setTiltDirection(dir);
      await sleep(0.01);
      expect(await t.read()).toBe(dir);
    }
  });

  it("lee los ejes como enteros y configura UNIT_RAW", async () => {
    await setup({ B: "tilt" });
    const t = hub.tilt("B");
    sim.setTiltAngle(-5, 10);
    expect(await t.x.read()).toBe(-5);
    expect(await t.y.read()).toBe(10);
    const cfg = sim.writes.map(([, d]) => d).find((d) => d[0] === 1 && d[1] === 2 && d[2] === 2);
    expect(cfg[9]).toBe(0); // UNIT_RAW
  });

  it("los ejes son recursos independientes", async () => {
    await setup({ B: "tilt" });
    const t = hub.tilt("B");
    sim.setTiltAngle(1, 1);
    await t.x.read();
    await t.y.read();
    sim.setTiltAngle(5, 5); await sleep(0.05);
    expect(t.x.hasChange("increase")).toBe(true);
    expect(t.y.hasChange("increase")).toBe(true);
  });

  it("detecta el cambio de dirección", async () => {
    await setup({ B: "tilt" });
    const t = hub.tilt("B");
    sim.setTiltDirection("none");
    await t.read();
    sim.setTiltDirection("left"); await sleep(0.05);
    expect(t.hasChange("left")).toBe(true);
    expect(t.hasChange("right")).toBe(false);
  });

  it("otro lector del mismo sensor no invalida la lectura (modo dirección vs. ángulo)", async () => {
    // El panel sondea la dirección mientras un programa lee el ángulo: el sensor solo
    // admite un formato a la vez, así que la lectura debe re-afirmar el suyo en vez de
    // fallar con "the device on connect id N changed".
    await setup({ B: "tilt" }, { silentSensors: true });
    const t = hub.tilt("B");
    const core = hub._session.core;
    sim.setTiltAngle(-13, -26);
    const pending = t.x.read();
    pending.catch(() => {});
    await sleep(0.05);
    // Otro lector (el panel) deja el sensor configurado en modo dirección.
    await core._call("write", [K.CHAR_INPUT_CMD, inputFormat(2, K.TYPE_TILT, K.TILT_DIRECTION, 1, K.UNIT_SI, true)]);
    core._modes.set(2, `${K.TYPE_TILT}/${K.TILT_DIRECTION}`);
    await sleep(0.05);
    sim.silentSensors = false;
    sim.setTiltDirection("neutral");
    await expect(pending).resolves.toBe(-13);
  });
});
