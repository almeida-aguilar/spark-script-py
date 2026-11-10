import { afterEach, describe, expect, it } from "vitest";
import * as K from "../src/core/constants.js";
import { LED_COLORS, SimulatedTransport } from "../src/index.js";
import { ConnectionFailedError, HubBusyError } from "../src/core/errors.js";
import { FAST, makeHub, sleep, waitFor } from "./helpers.js";

let hub, sim;
afterEach(async () => { await hub?.disconnect(); hub = sim = undefined; });
const setup = async (devices, opts) => { ({ hub, sim } = makeHub(devices, opts)); hub.connect(); await hub.waitConnection(5); };

describe("LED", () => {
  it("color(r, g, b) envía el comando de modo absoluto", async () => {
    await setup();
    await hub.led.color(0, 255, 64);
    expect(sim.ledMode).toBe(K.LED_ABSOLUTE);
    expect(sim.writesTo(K.CHAR_OUTPUT_CMD).at(-1)).toEqual(Uint8Array.from([6, 4, 3, 0, 255, 64]));
  });

  it("color(nombre) cambia a modo discreto y vuelve a absoluto solo cuando hace falta", async () => {
    await setup();
    await hub.led.color("dark_green");
    expect(sim.ledMode).toBe(K.LED_DISCRETE);
    expect(sim.writesTo(K.CHAR_OUTPUT_CMD).at(-1)).toEqual(Uint8Array.from([6, 4, 1, LED_COLORS.dark_green]));
    const configs = () => sim.writesTo(K.CHAR_INPUT_CMD).length;
    const n = configs();
    await hub.led.color("blue");
    expect(configs()).toBe(n); // sin reconfigurar
    await hub.led.color(1, 2, 3);
    expect(sim.ledMode).toBe(K.LED_ABSOLUTE);
  });

  it("el catálogo usa los índices reales del firmware", async () => {
    expect(LED_COLORS.dark_green).toBe(6);
    expect(LED_COLORS.light_green).toBe(5);
    expect(LED_COLORS.yellow).toBe(7);
    expect(LED_COLORS.white).toBe(10);
    expect(LED_COLORS.off).toBe(0);
  });

  it("valida argumentos", async () => {
    await setup();
    expect(() => hub.led.color("chartreuse")).toThrow(RangeError);
    expect(() => hub.led.color(256, 0, 0)).toThrow(RangeError);
    expect(() => hub.led.color(1.5, 0, 0)).toThrow(TypeError);
    expect(() => hub.led.color("1", 0, 0)).toThrow(TypeError);
    expect(() => hub.led.color()).toThrow(TypeError);
  });
});

describe("Button", () => {
  it("refleja pulsaciones y el estado inicial leído al conectar", async () => {
    await setup();
    expect(hub.button.read()).toBe(false);
    sim.press();
    expect(hub.button.read()).toBe(true);
    sim.release();
    expect(hub.button.read()).toBe(false);
  });

  it("detecta los cambios y los consume una sola vez", async () => {
    await setup();
    sim.press();
    await sleep(0.05);
    expect(hub.button.hasChange()).toBe(true);
    expect(hub.button.hasChange()).toBe(false); // consumido
    sim.release();
    await sleep(0.05);
    expect(hub.button.hasChange("released")).toBe(true);
    expect(hub.button.hasChange("pressed")).toBe(false);
  });

  it("espera un cambio y devuelve su tipo", async () => {
    await setup();
    const pending = hub.button.waitChange("pressed");
    await sleep(0.05);
    sim.press();
    await expect(pending).resolves.toBe("pressed");
  });

  it("lee el estado ya pulsado al conectar", async () => {
    ({ hub, sim } = makeHub());
    sim.button = true;
    hub.connect();
    await hub.waitConnection(5);
    expect(hub.button.read()).toBe(true);
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

  it("connect() inicia y wait_connection() espera", async () => {
    ({ hub, sim } = makeHub());
    hub.connect();
    expect(await hub.waitConnection(2)).toBe(true);
    expect(hub.isConnected).toBe(true);
  });

  it("wait_connection devuelve False si se agota el tiempo", async () => {
    ({ hub, sim } = makeHub({ A: "motor" }, { failConnect: true }));
    hub.connect();
    await expect(hub.waitConnection(0.2)).rejects.toBeInstanceOf(ConnectionFailedError);
  });

  it("tolera eventos de puerto repetidos sin reconfigurar sensores", async () => {
    await setup({ A: "distance" }, { repeatPorts: 0.04 });
    const d = hub.distance("A");
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
    expect(await waitFor(() => hub.ports().b === "tilt")).toBe(true);
    sim.detach("B");
    expect(await waitFor(() => hub.ports().b === undefined)).toBe(true);
  });

  it("refreshPorts vuelve a descubrir los dispositivos", async () => {
    await setup({ A: "motor", B: "distance" });
    expect(await hub.refreshPorts()).toEqual({ a: "motor", b: "distance" });
  });

  it("falla con claridad si no hay hub", async () => {
    ({ hub, sim } = makeHub(undefined, { failConnect: true }));
    hub.connect();
    await expect(hub.waitConnection(1)).rejects.toBeInstanceOf(ConnectionFailedError);
    expect(hub.state).toBe("error");
    await hub.disconnect();
    expect(hub.state).toBe("disconnected");
  });

  it("no admite conectar dos veces a la vez", async () => {
    ({ hub, sim } = makeHub());
    hub.connect();
    hub.connect(); // la segunda llamada no hace nada
    expect(await hub.waitConnection(2)).toBe(true);
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
