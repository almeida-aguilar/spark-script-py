import { afterEach, describe, expect, it } from "vitest";
import * as K from "../src/core/constants.js";
import {
  AmbiguousDeviceError, DeviceNotFoundError, DeviceTypeError, InvalidStateError,
} from "../src/core/errors.js";
import { makeHub } from "./helpers.js";

let hub, sim;
afterEach(async () => { await hub?.disconnect(); hub = sim = undefined; });
const setup = async (devices, opts) => { ({ hub, sim } = makeHub(devices, opts)); await hub.connect(); };

describe("Motor", () => {
  it("reconoce los dispositivos de los puertos A y B", async () => {
    await setup({ A: "motor", B: "distance" });
    expect(hub.ports).toEqual({ A: "motor", B: "distance" });
  });

  it("envía [conn,01,01,int8] para velocidades -100..100", async () => {
    await setup({ A: "motor", B: "motor" });
    const a = hub.motor("A");
    await a.run(100); expect(sim.motors[1]).toBe(100);
    await a.run(-100); expect(sim.motors[1]).toBe(-100);
    await a.run(-87);
    expect(sim.writesTo(K.CHAR_OUTPUT_CMD).at(-1)).toEqual(Uint8Array.of(1, 1, 1, 0xa9));
    await a.stop(); expect(sim.motors[1]).toBe(0);
    await hub.motor("B").run(40); expect(sim.motors[2]).toBe(40);
    await hub.motor("B").stop();
  });

  it("valida el tipo y el rango de la velocidad", async () => {
    await setup({ A: "motor" });
    const a = hub.motor("A");
    expect(() => a.run(101)).toThrow(RangeError);
    expect(() => a.run(-101)).toThrow(RangeError);
    expect(() => a.run(1.5)).toThrow(TypeError);
    expect(() => a.run("50")).toThrow(TypeError);
    expect(() => a.run(NaN)).toThrow(TypeError);
  });

  it("selecciona motor por puerto o automáticamente", async () => {
    await setup({ A: "motor", B: "distance" });
    expect(hub.motor().port).toBe("A");
    expect(hub.motor("a").port).toBe("A");
    expect(() => hub.motor("B")).toThrow(DeviceTypeError);
    expect(() => hub.motor("C")).toThrow(RangeError);
    expect(() => hub.motor(3)).toThrow(TypeError);
  });

  it("informa de dispositivo ausente y de ambigüedad", async () => {
    await setup({ A: "motor" });
    expect(() => hub.motor("B")).toThrow(DeviceNotFoundError);
    expect(() => hub.tiltSensor()).toThrow(DeviceNotFoundError);
    await hub.disconnect();
    ({ hub, sim } = makeHub({ A: "motor", B: "motor" }));
    await hub.connect();
    expect(() => hub.motor()).toThrow(AmbiguousDeviceError);
  });

  it("MotorGroup acciona A y luego B, y valida sus argumentos", async () => {
    await setup({ A: "motor", B: "motor" });
    const group = hub.motors(["B", "A"]);
    await group.run(30);
    const order = sim.writesTo(K.CHAR_OUTPUT_CMD).map((d) => d[0]);
    expect(order).toEqual([1, 2]);
    expect(String(group)).toBe("MotorGroup('A', 'B')");
    await group.stop();
    expect([sim.motors[1], sim.motors[2]]).toEqual([0, 0]);
    expect(() => hub.motors("AB")).toThrow(TypeError);
    expect(() => hub.motors([])).toThrow(RangeError);
    expect(() => hub.motors(["A", "A"])).toThrow(RangeError);
  });

  it("disconnect para los motores activos", async () => {
    await setup({ A: "motor" });
    await hub.motor("A").run(70);
    expect(await hub.disconnect()).toBe(true);
    expect(sim.motors[1]).toBe(0);
  });

  it("no se puede operar sin conexión", async () => {
    ({ hub, sim } = makeHub());
    expect(() => hub.motor("A")).toThrow(InvalidStateError);
  });
});
