import { afterEach, describe, expect, it } from "vitest";
import * as K from "../src/core/constants.js";
import { NotConnectedError, PortError } from "../src/core/errors.js";
import { makeHub } from "./helpers.js";

let hub, sim;
afterEach(async () => { await hub?.disconnect(); hub = sim = undefined; });
const setup = async (devices, opts) => { ({ hub, sim } = makeHub(devices, opts)); hub.connect(); await hub.waitConnection(5); };

describe("Motor", () => {
  it("reconoce los dispositivos de los puertos A y B (nombres en minúsculas)", async () => {
    await setup({ A: "motor", B: "distance" });
    expect(hub.ports()).toEqual({ a: "motor", b: "distance" });
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
    expect(() => a.run("50")).toThrow(TypeError);
    expect(() => a.run(NaN)).toThrow(RangeError); // no finito: ValueError en Python
    expect(() => a.run(Infinity)).toThrow(RangeError);
    // Redondeo al entero más cercano (resolución del dispositivo)
    await a.run(50.4); expect(sim.motors[1]).toBe(50);
    await a.run(-50.6); expect(sim.motors[1]).toBe(-51);
  });

  it("el selector solo valida el nombre del puerto (no exige conexión)", async () => {
    await setup({ A: "motor", B: "distance" });
    expect(hub.motor("a").port).toBe("a");
    expect(hub.motor("A").port).toBe("a");
    expect(() => hub.motor("C")).toThrow(RangeError);
    expect(() => hub.motor(3)).toThrow(TypeError);
  });

  it("el error de puerto vacío o equivocado aparece al usar el recurso", async () => {
    await setup({ A: "motor" });
    expect(() => hub.motor("B").run(50)).toThrow(PortError);
    await expect(hub.distance("A").read()).rejects.toBeInstanceOf(PortError);
    await expect(hub.tilt("A").read()).rejects.toBeInstanceOf(PortError);
  });

  it("sin conexión, usar un motor lanza NotConnectedError", async () => {
    ({ hub, sim } = makeHub());
    const motor = hub.motor("A"); // el selector no exige conexión
    expect(() => motor.run(50)).toThrow(NotConnectedError);
  });

  it("disconnect para los motores activos", async () => {
    await setup({ A: "motor" });
    await hub.motor("A").run(70);
    expect(await hub.disconnect()).toBe(true);
    expect(sim.motors[1]).toBe(0);
  });
});
