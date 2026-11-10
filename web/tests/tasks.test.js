import { describe, expect, it } from "vitest";
import { InvalidStateError } from "../src/core/errors.js";
import { TaskCancelled, TaskManager, task } from "../src/api/tasks.js";
import { HubState } from "../src/core/state-machine.js";
import { coreOf, makeHub, sleep } from "./helpers.js";

describe("TaskManager", () => {
  it("el orden de registro desempata", async () => {
    const tm = new TaskManager(); const out = [];
    tm.add(async () => { out.push("a"); });
    tm.add(async () => { out.push("b"); });
    tm.add(() => { out.push("c"); }); // una función normal es una tarea de un solo paso
    await tm.wait();
    expect(out).toEqual(["a", "b", "c"]);
  });

  it("sleep cede el control y ordena por tiempo", async () => {
    const tm = new TaskManager(); const out = [];
    tm.add(async (ctx) => { await ctx.sleep(0.06); out.push("lenta"); });
    tm.add(async (ctx) => { await ctx.sleep(0.02); out.push("rapida"); });
    await tm.wait();
    expect(out).toEqual(["rapida", "lenta"]);
  });

  it("las tareas de fondo no mantienen wait vivo y se cancelan con sus finally", async () => {
    const tm = new TaskManager(); let ticks = 0; let cleaned = false;
    tm.add(async (ctx) => {
      try { for (;;) { ticks += 1; await ctx.sleep(0.01); } } finally { cleaned = true; }
    }, { background: true });
    tm.add(async (ctx) => { await ctx.sleep(0.06); });
    await tm.wait();
    expect(ticks).toBeGreaterThan(2);
    expect(cleaned).toBe(true);
  });

  it("wait sin tareas normales vuelve de inmediato y cancela las de fondo", async () => {
    const tm = new TaskManager(); const ran = [];
    tm.add(() => { ran.push(1); }, { background: true });
    await tm.wait();
    expect(ran.length).toBeLessThanOrEqual(1);
  });

  it("el gestor es reutilizable tras wait", async () => {
    const tm = new TaskManager(); let n = 0;
    tm.add(() => { n += 1; }); await tm.wait();
    tm.add(() => { n += 1; }); await tm.wait();
    expect(n).toBe(2);
  });

  it("una tarea puede añadir tareas mientras corre", async () => {
    const tm = new TaskManager(); const out = [];
    tm.add(async (ctx) => { out.push("padre"); tm.add(() => { out.push("hijo"); }); await ctx.sleep(0.02); });
    await tm.wait();
    expect(out).toEqual(["padre", "hijo"]);
  });

  it("un error cancela el resto, ejecuta sus finally y relanza el original", async () => {
    const tm = new TaskManager(); let cleaned = false;
    tm.add(async (ctx) => { try { await ctx.sleep(5); } finally { cleaned = true; } });
    tm.add(async (ctx) => { await ctx.sleep(0.02); throw new RangeError("fallo"); });
    await expect(tm.wait()).rejects.toThrow("fallo");
    expect(cleaned).toBe(true);
  });

  it("rechaza funciones no válidas y opciones erróneas", () => {
    const tm = new TaskManager();
    expect(() => tm.add(42)).toThrow(TypeError);
    expect(() => tm.add(() => {}, true)).toThrow(TypeError);
    expect(() => tm.add(() => {}, { background: "si" })).toThrow(TypeError);
  });

  it("valida sleep", () => {
    for (const bad of ["1", null, undefined]) expect(() => task.sleep(bad)).toThrow(TypeError);
    for (const bad of [-1, NaN, Infinity]) expect(() => task.sleep(bad)).toThrow(RangeError);
  });

  it("wait desde una tarea es inválido", async () => {
    const tm = new TaskManager();
    tm.add(async () => { await tm.wait(); });
    await expect(tm.wait()).rejects.toBeInstanceOf(InvalidStateError);
  });

  it("cancel antes de wait significa que nada se ejecuta", async () => {
    const tm = new TaskManager(); let ran = false;
    tm.add(() => { ran = true; });
    await tm.cancel();
    await tm.wait();
    expect(ran).toBe(false);
  });

  it("cancel desde una tarea cierra a las demás y a sí misma en su siguiente sleep", async () => {
    const tm = new TaskManager(); const out = [];
    tm.add(async (ctx) => { try { await ctx.sleep(5); } finally { out.push("otra"); } });
    tm.add(async (ctx) => {
      await ctx.sleep(0.01);
      ctx.cancelAll();
      out.push("tras-cancel");
      await expect(ctx.sleep(0.01)).rejects.toBeInstanceOf(TaskCancelled);
    });
    const t0 = performance.now();
    await tm.wait();
    expect(performance.now() - t0).toBeLessThan(500); // sin esperas por tope
    expect([...out].sort()).toEqual(["otra", "tras-cancel"]); // los finally ajenos corren de forma asíncrona
  });

  it("un error durante la limpieza se registra en diagnostics", async () => {
    const tm = new TaskManager();
    tm.add(async (ctx) => { try { await ctx.sleep(5); } finally { throw new Error("limpieza"); } });
    tm.add(async (ctx) => { await ctx.sleep(0.01); throw new Error("primario"); });
    await expect(tm.wait()).rejects.toThrow("primario");
    expect(tm.diagnostics).toHaveLength(1);
    expect(tm.diagnostics[0][1].message).toBe("limpieza");
  });

  it("AbortSignal hace de Ctrl+C: cancela, llama a onInterrupt y relanza", async () => {
    let interrupted = false; let cleaned = false;
    const tm = new TaskManager({ onInterrupt: async () => { interrupted = true; } });
    tm.add(async (ctx) => { try { await ctx.sleep(5); } finally { cleaned = true; } });
    const ac = new AbortController();
    setTimeout(() => ac.abort(), 20);
    await expect(tm.wait({ signal: ac.signal })).rejects.toBeDefined();
    expect(interrupted && cleaned).toBe(true);
  });
});

describe("tareas con un hub", () => {
  it("LED y motor funcionan a la vez", async () => {
    const { hub, sim } = makeHub({ A: "motor" });
    await hub.connect();
    let blinks = 0;
    hub.tasks.add(async (ctx) => { for (;;) { await hub.led.on(); blinks += 1; await ctx.sleep(0.02); await hub.led.off(); await ctx.sleep(0.02); } }, { background: true });
    hub.tasks.add(async (ctx) => { await hub.motor("A").run(40); await ctx.sleep(0.15); await hub.motor("A").stop(); });
    await hub.tasks.wait();
    expect(blinks).toBeGreaterThan(2);
    expect(sim.motors[1]).toBe(0);
    await hub.disconnect();
  });

  it("cancel no para los motores, pero un finally sí", async () => {
    const { hub, sim } = makeHub({ A: "motor" });
    await hub.connect();
    hub.tasks.add(async (ctx) => {
      await hub.motor("A").run(40);
      try { await ctx.sleep(5); } finally { await hub.motor("A").stop(); }
    });
    setTimeout(() => hub.tasks.cancel(), 30);
    await hub.tasks.wait();
    expect(sim.motors[1]).toBe(0);
    await hub.disconnect();
  });

  it("disconnect cancela las tareas antes de parar los motores", async () => {
    const { hub, sim } = makeHub({ A: "motor" });
    await hub.connect();
    const waiting = (async () => {
      hub.tasks.add(async (ctx) => { for (;;) { await hub.motor("A").run(30); await ctx.sleep(0.01); } });
      await hub.tasks.wait();
    })();
    await sleep(0.05);
    expect(sim.motors[1]).toBe(30);
    await hub.disconnect();
    await waiting;
    expect(sim.motors[1]).toBe(0); // ninguna tarea pudo reordenar el motor tras la parada
    expect(coreOf(hub).state).toBe(HubState.DISCONNECTED);
  });
});
