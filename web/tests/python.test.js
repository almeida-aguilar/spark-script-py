// Ejecuta programas Python escritos para la biblioteca original sobre el simulador, con Pyodide
// real (JSPI). Cubre el puente síncrono, las tareas del original, los errores y «Detener».
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as K from "../src/core/constants.js";
import { Hub } from "../src/api/hub.js";
import { PythonRuntime } from "../src/python/runtime.js";
import { SimulatedTransport } from "../src/transport/simulated.js";
import { FAST } from "./helpers.js";

let rt, hub, sim;
const out = [];

beforeAll(async () => {
  sim = new SimulatedTransport({ A: "motor", B: "distance" }, { externalDelay: 0.03 });
  hub = new Hub({ transport: sim, timing: FAST });
  await hub.connect();
  rt = new PythonRuntime({
    getHub: () => hub,
    onOutput: (s, t) => out.push(`${s}:${t}`),
    loader: () => import("pyodide"),
    indexURL: `${resolve("node_modules/pyodide")}/`,
  });
  await rt.init();
}, 60000);
afterAll(async () => { await hub?.disconnect(); });

const run = async (code) => { out.length = 0; return rt.run(code); };

describe("editor Python (Pyodide + JSPI)", () => {
  it("ejecuta el ejemplo motor.py original (with Hub, time.sleep)", async () => {
    const code = (await import("../src/python/examples/motor.py?raw")).default;
    const r = await run(code.replace("time.sleep(2)", "time.sleep(0.2)"));
    expect(r.ok).toBe(true);
    const writes = sim.writesTo(K.CHAR_OUTPUT_CMD).map((d) => d[3] << 24 >> 24);
    expect(writes).toContain(100);
    expect(writes.at(-1)).toBe(0); // el programa para el motor (y la parada final de seguridad también)
    expect(writes.indexOf(100)).toBeLessThan(writes.lastIndexOf(0));
  });

  it("lee sensores, LED y botón con la API síncrona", async () => {
    sim.setDistance(7);
    const r = await run(`
from wedopy import Hub, GREEN
with Hub() as hub:
    print("ports", hub.ports)
    print("dist", hub.distance_sensor().read(), hub.distance_sensor("B").is_near(8))
    hub.led.index(GREEN)
    hub.led.rgb(10, 20, 30)
    print("btn", hub.button.is_pressed)
`);
    expect(r.ok).toBe(true);
    expect(out.join("")).toContain("ports {'A': 'motor', 'B': 'distance'}");
    expect(out.join("")).toContain("dist 7 True");
    expect(out.join("")).toContain("btn False");
    expect(sim.writesTo(K.CHAR_OUTPUT_CMD).filter((d) => d[0] === K.CONN_RGB).at(-1)).toEqual(Uint8Array.of(6, 4, 3, 10, 20, 30));
  });

  it("las tareas cooperativas originales (yield task.sleep) funcionan", async () => {
    const code = (await import("../src/python/examples/blink_and_move.py?raw")).default;
    const r = await run(code.replace("yield task.sleep(3)", "yield task.sleep(0.4)"));
    expect(r.ok).toBe(true);
    expect(sim.motors[1]).toBe(0);
    expect(sim.writesTo(K.CHAR_OUTPUT_CMD).filter((d) => d[0] === 6).length).toBeGreaterThan(2); // parpadeo
  });

  it("traduce los errores a la jerarquía Python de wedopy", async () => {
    const r = await run(`
from wedopy import Hub, DeviceTypeError, DeviceNotFoundError, WedoError
hub = Hub()
for fn, exc in [(lambda: hub.motor("B"), DeviceTypeError),
                (lambda: hub.tilt_sensor(), DeviceNotFoundError)]:
    try:
        fn()
    except exc as e:
        print("OK", type(e).__name__, isinstance(e, WedoError))
try:
    hub.motor("A").run(500)
except ValueError as e:
    print("VALUE", e)
try:
    hub.motor("A").run(True)
except TypeError as e:
    print("TYPE")
`);
    expect(r.ok).toBe(true);
    const text = out.join("");
    expect(text).toContain("OK DeviceTypeError True");
    expect(text).toContain("OK DeviceNotFoundError True");
    expect(text).toContain("VALUE speed must be in -100..100, got 500");
    expect(text).toContain("TYPE");
  });

  it("muestra los errores del programa con su traceback y para los motores", async () => {
    const r = await run(`
from wedopy import Hub
hub = Hub()
hub.motor("A").run(60)
raise RuntimeError("boom")
`);
    expect(r.ok).toBe(false);
    expect(out.join("")).toContain("RuntimeError: boom");
    expect(sim.motors[1]).toBe(0); // parada de seguridad al terminar el programa
  });

  it("«Detener» interrumpe un programa dormido y para los motores", async () => {
    const p = run(`
import time
from wedopy import Hub
hub = Hub()
hub.motor("A").run(50)
time.sleep(30)
print("no debería llegar")
`);
    await new Promise((r) => setTimeout(r, 400));
    expect(sim.motors[1]).toBe(50);
    rt.stop();
    const r = await p;
    expect(r.stopped).toBe(true);
    expect(out.join("")).not.toContain("no debería");
    expect(sim.motors[1]).toBe(0);
  });

  it("«Detener» dentro de tasks.wait() cancela las tareas y ejecuta sus finally", async () => {
    const p = run(`
from wedopy import Hub, task
hub = Hub()
def mover():
    m = hub.motor("A")
    try:
        m.run(40)
        while True:
            yield task.sleep(0.05)
    finally:
        m.stop()
        print("limpieza")
hub.tasks.add(mover)
hub.tasks.wait()
`);
    await new Promise((r) => setTimeout(r, 400));
    rt.stop();
    const r = await p;
    expect(r.stopped).toBe(true);
    expect(out.join("")).toContain("limpieza");
    expect(sim.motors[1]).toBe(0);
  });

  it("sin hub conectado da un error claro", async () => {
    const saved = hub;
    hub = null;
    const r = await run("from wedopy import Hub\nHub()");
    hub = saved;
    expect(r.ok).toBe(false);
    expect(out.join("")).toMatch(/HubConnectionError: No hay hub/);
  });

  it("ejecuta los 6 ejemplos originales sin errores de sintaxis ni de importación", async () => {
    const examples = import.meta.glob("../src/python/examples/*.py", { query: "?raw", import: "default", eager: true });
    for (const [name, code] of Object.entries(examples)) {
      expect(() => rt.py.runPython(`compile(${JSON.stringify(code)}, ${JSON.stringify(name)}, "exec")`), name).not.toThrow();
    }
    expect(Object.keys(examples)).toHaveLength(6);
  });
});
