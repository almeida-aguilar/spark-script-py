import { afterEach, describe, expect, it } from "vitest";
import * as K from "../src/core/constants.js";
import { Hub, HubBusyError, LED, runningTime, GREEN, ROJO, SimulatedTransport } from "../src/index.js";
import { FAST, makeHub, sleep, waitFor } from "./helpers.js";

let hub, sim;
afterEach(async () => { await hub?.disconnect(); hub = sim = undefined; });
const setup = async (devices, opts) => { ({ hub, sim } = makeHub(devices, opts)); await hub.connect(); };

describe("LED", () => {
  it("rgb y on/off envían los comandos de modo absoluto", async () => {
    await setup();
    await hub.led.rgb(0, 255, 64);
    expect(sim.ledMode).toBe(K.LED_ABSOLUTE);
    expect(sim.writesTo(K.CHAR_OUTPUT_CMD).at(-1)).toEqual(Uint8Array.from([6, 4, 3, 0, 255, 64]));
    await hub.led.on();
    expect(sim.writesTo(K.CHAR_OUTPUT_CMD).at(-1)).toEqual(Uint8Array.from([6, 4, 3, 255, 255, 255]));
    await hub.led.off();
  });

  it("index cambia a modo discreto y vuelve a absoluto solo cuando hace falta", async () => {
    await setup();
    await hub.led.index(LED.GREEN);
    expect(sim.ledMode).toBe(K.LED_DISCRETE);
    const configs = () => sim.writesTo(K.CHAR_INPUT_CMD).length;
    const n = configs();
    await hub.led.index(4);
    expect(configs()).toBe(n); // sin reconfigurar
    await hub.led.rgb(1, 2, 3);
    expect(sim.ledMode).toBe(K.LED_ABSOLUTE);
    expect([GREEN, ROJO, LED.ROJO]).toEqual([5, 8, 8]);
  });

  it("valida argumentos", async () => {
    await setup();
    expect(() => hub.led.index(11)).toThrow(RangeError);
    expect(() => hub.led.rgb(256, 0, 0)).toThrow(RangeError);
    expect(() => hub.led.rgb(1.5, 0, 0)).toThrow(TypeError);
    expect(() => hub.led.rgb("1", 0, 0)).toThrow(TypeError);
  });
});

describe("Button", () => {
  it("refleja pulsaciones y el estado inicial leído al conectar", async () => {
    await setup();
    expect(hub.button.isPressed).toBe(false);
    expect(hub.button.isReleased).toBe(true);
    sim.press();
    expect(hub.button.isPressed).toBe(true);
    sim.release();
    expect(hub.button.isPressed).toBe(false);
  });

  it("lee el estado ya pulsado al conectar", async () => {
    ({ hub, sim } = makeHub());
    sim.button = true;
    await hub.connect();
    expect(hub.button.isPressed).toBe(true);
  });
});

describe("Hub", () => {
  it("conecta, lee la batería y se desconecta dos veces sin error", async () => {
    await setup();
    expect(hub.isConnected).toBe(true);
    expect(hub.state).toBe("connected");
    expect(await hub.readBattery()).toBe(87);
    await hub.disconnect();
    await hub.disconnect();
    expect(hub.state).toBe("disconnected");
  });

  it("tolera eventos de puerto repetidos sin reconfigurar sensores", async () => {
    await setup({ A: "distance" }, { repeatPorts: 0.04 });
    const d = hub.distanceSensor();
    sim.setDistance(3);
    expect(await d.read()).toBe(3);
    const n = sim.writesTo(K.CHAR_INPUT_CMD).length;
    await sleep(0.2);
    expect(await d.read()).toBe(3);
    expect(sim.writesTo(K.CHAR_INPUT_CMD).length).toBe(n);
  });

  it("detecta conexión/retirada de dispositivos en caliente", async () => {
    await setup({ A: "motor" });
    sim.attach("B", "tilt");
    expect(await waitFor(() => hub.ports.B === "tilt")).toBe(true);
    sim.detach("B");
    expect(await waitFor(() => hub.ports.B === undefined)).toBe(true);
  });

  it("refreshPorts vuelve a descubrir los dispositivos", async () => {
    await setup({ A: "motor", B: "distance" });
    expect(await hub.refreshPorts()).toEqual({ A: "motor", B: "distance" });
  });

  it("falla con claridad si no hay hub", async () => {
    ({ hub, sim } = makeHub(undefined, { failConnect: true }));
    await expect(hub.connect()).rejects.toThrow(/no WeDo 2.0 hub/);
    expect(hub.state).toBe("error"); // igual que _abort_connect en el núcleo Cython
    await hub.disconnect(); // limpia y vuelve a "disconnected"
    expect(hub.state).toBe("disconnected");
  });

  it("no admite conectar dos veces a la vez", async () => {
    ({ hub, sim } = makeHub());
    const first = hub.connect();
    await expect(hub.connect()).rejects.toBeInstanceOf(HubBusyError);
    await first;
  });

  it("Hub.use garantiza la desconexión y la parada de motores", async () => {
    const transport = new SimulatedTransport({ A: "motor" }, { externalDelay: 0.03 });
    await expect(Hub.use(async (h) => {
      await h.motor("A").run(80);
      throw new Error("boom");
    }, { transport, timing: FAST })).rejects.toThrow("boom");
    expect(transport.motors[1]).toBe(0);
    expect(transport.connected).toBe(false);
  });

  it("runningTime devuelve milisegundos crecientes", async () => {
    const a = runningTime();
    await sleep(0.02);
    expect(runningTime()).toBeGreaterThanOrEqual(a + 15);
  });

  it("shutdown apaga el hub y exige reconectar", async () => {
    await setup({ A: "motor" });
    await hub.motor("A").run(10);
    await hub.shutdown();
    expect(hub.state).toBe("shutdown");
    expect(sim.writesTo(K.CHAR_TURN_OFF)).toHaveLength(1);
    expect(sim.motors[1]).toBe(0);
  });
});
