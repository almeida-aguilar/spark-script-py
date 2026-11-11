// Ejecuta programas Python de la API v0.2.0 sobre el simulador, con Pyodide real (JSPI).
// Cubre el puente síncrono, las tareas cooperativas, los errores y «Detener».
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
  hub.connect();
  await hub.waitConnection(5);
  rt = new PythonRuntime({
    getHub: () => hub,
    onOutput: (s, t) => out.push(`${s}:${t}`),
    loader: () => import("pyodide"),
    indexURL: `${resolve("node_modules/pyodide")}/`,
  });
  await rt.init();
}, 60000);
afterAll(async () => { await hub?.disconnect(); });

const run = async (code) => {
  out.length = 0;
  // El programa puede haber desconectado el hub explícitamente: volver a conectar.
  if (hub && !hub.isConnected) { hub.connect(); await hub.waitConnection(5); }
  return rt.run(code);
};

describe("editor Python (Pyodide + JSPI)", () => {
  it("usa la API nueva: with Hub(), ports() y led.color()", async () => {
    sim.setDistance(7);
    const r = await run(`
from wedo import Hub
with Hub() as hub:
    print("ports", hub.ports())
    print("dist", hub.distance("B").read())
    hub.led.color("light_green")
    hub.led.color(10, 20, 30)
    print("btn", hub.button.read())
`);
    expect(r.ok, out.join("\n")).toBe(true);
    expect(out.join("")).toContain("ports {'a': 'motor', 'b': 'distance'}");
    expect(out.join("")).toContain("dist 7");
    expect(out.join("")).toContain("btn False");
    expect(sim.writesTo(K.CHAR_OUTPUT_CMD).filter((d) => d[0] === K.CONN_RGB).at(-1)).toEqual(Uint8Array.of(6, 4, 3, 10, 20, 30));
  });

  it("las tareas cooperativas funcionan (spawn + wait)", async () => {
    const code = (await import("../src/python/examples/blink_and_move.py?raw")).default;
    const r = await run(code.replace("wedo.task.wait(3)", "wedo.task.wait(0.4)"));
    expect(r.ok).toBe(true);
    expect(sim.motors[1]).toBe(0);
    expect(sim.writesTo(K.CHAR_OUTPUT_CMD).filter((d) => d[0] === 6).length).toBeGreaterThan(2); // parpadeo
  });

  it("traduce los errores a la jerarquía de la API", async () => {
    const r = await run(`
from wedo import Hub, PortError, NotConnectedError, WedoError
hub = Hub()
for fn, exc in [(lambda: hub.motor("B").run(10), PortError),
                (lambda: hub.distance("A").read(), PortError)]:
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
try:
    hub.motor("C")
except ValueError as e:
    print("PUERTO")
`);
    expect(r.ok, out.join("\n")).toBe(true);
    const text = out.join("");
    expect(text).toContain("OK PortError True");
    expect(text).toContain("VALUE motor (puerto \"a\"): el valor 500 está fuera del rango -100..100");
    expect(text).toContain("TYPE");
    expect(text).toContain("PUERTO");
  });

  it("muestra los errores del programa con su traceback y para los motores", async () => {
    const r = await run(`
from wedo import Hub
hub = Hub()
hub.motor("A").run(60)
raise RuntimeError("boom")
`);
    expect(r.ok, out.join("\n")).toBe(false);
    expect(out.join("")).toContain("RuntimeError: boom");
    expect(sim.motors[1]).toBe(0); // parada de seguridad al terminar el programa
  });

  it("«Detener» interrumpe un programa dormido y para los motores", async () => {
    const p = run(`
import time
from wedo import Hub
hub = Hub()
hub.motor("A").run(50)
time.sleep(30)
print("no debería llegar")
`);
    await new Promise((r) => setTimeout(r, 400));
    expect(sim.motors[1]).toBe(50);
    rt.stop();
    const r = await p;
    expect(r.stopped, out.join("\n")).toBe(true);
    expect(out.join("")).not.toContain("no debería");
    expect(sim.motors[1]).toBe(0);
  });

  it("«Detener» cancela las tareas y ejecuta sus finally", async () => {
    const p = run(`
import wedo
from wedo import Hub
hub = Hub()
def mover():
    m = hub.motor("A")
    try:
        m.run(40)
        while True:
            wedo.task.wait(0.05)
    finally:
        m.stop()
        print("limpieza")
wedo.task.spawn(mover)
wedo.task.wait(30)
`);
    await new Promise((r) => setTimeout(r, 400));
    rt.stop();
    const r = await p;
    expect(r.stopped, out.join("\n")).toBe(true);
    expect(out.join("")).toContain("limpieza");
    expect(sim.motors[1]).toBe(0);
  });

  it("cancelar una tarea lanza TaskCancelled y ejecuta su finally", async () => {
    const r = await run(`
import wedo
from wedo import Hub, TaskCancelled
hub = Hub()
def mover():
    try:
        while True:
            wedo.task.wait(0.05)
    finally:
        print("limpieza")
t = wedo.task.spawn(mover)
wedo.task.wait(0.15)
t.cancel()
t.join()
`);
    expect(r.ok, out.join("\n")).toBe(true);
    expect(out.join("")).toContain("limpieza");
  });

  it("el teclado: seleccionar, usar y errores (sin entorno de captura en node)", async () => {
    const r = await run(`
import wedo
from wedo import Hub, KeyboardUnavailableError, WedoError

space = wedo.key("space")  # del módulo: no hace falta crear un Hub
up = wedo.key("UP")
print("keys", repr(space), up.name, space.name)
try:
    space.read()
    print("leido")
except KeyboardUnavailableError as e:
    print("kue", type(e) is KeyboardUnavailableError, isinstance(e, WedoError))

with Hub() as hub:
    print("en el with ok")
try:
    wedo.key("xx")
except ValueError as e:
    print("value", "tecla" in str(e) and "no válida" in str(e))
try:
    wedo.key(3)
except TypeError:
    print("type ok")
`);
    expect(r.ok, out.join("\n")).toBe(true);
    expect(out.join("")).toContain("keys Key('space') up space");
    expect(out.join("")).toContain("en el with ok");
    expect(out.join("")).toContain("kue True True"); // usar lanza KeyboardUnavailableError en node
    expect(out.join("")).toContain("value True");
    expect(out.join("")).toContain("type ok");
  });

  it("sin hub conectado da un error claro", async () => {
    const saved = hub;
    hub = null;
    const r = await run("from wedo import Hub\nHub()");
    hub = saved;
    expect(r.ok).toBe(false);
    expect(out.join("")).toMatch(/NotConnectedError|No hay hub/);
  });

  it("los ejemplos compilan sin errores de sintaxis", async () => {
    const examples = import.meta.glob("../src/python/examples/*.py", { query: "?raw", import: "default", eager: true });
    for (const [name, code] of Object.entries(examples)) {
      expect(() => rt.py.runPython(`compile(${JSON.stringify(code)}, ${JSON.stringify(name)}, "exec")`), name).not.toThrow();
    }
  });
});
