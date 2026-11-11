import { afterEach, describe, expect, it } from "vitest";
import { TaskCancelled, task as wedopyTask } from "../src/api/tasks.js";
import { makeHub, sleep } from "./helpers.js";

let hub, sim;
afterEach(async () => { await hub?.disconnect(); hub = sim = undefined; });
const setup = async (devices, opts) => { ({ hub, sim } = makeHub(devices, opts)); hub.connect(); await hub.waitConnection(5); };

describe("task (del módulo)", () => {
  it("spawn arranca la tarea y join espera a que termine", async () => {
    await setup({ A: "motor" });
    const marks = [];
    const t = wedopyTask.spawn(async () => {
      marks.push("start");
      await wedopyTask.wait(0.05);
      marks.push("end");
    });
    expect(t.id).toBeGreaterThan(0);
    await t.join();
    expect(marks).toEqual(["start", "end"]);
  });

  it("varias tareas se alternan de verdad", async () => {
    await setup();
    const order = [];
    const a = wedopyTask.spawn(async () => {
      order.push("a1");
      await wedopyTask.wait(0.08);
      order.push("a2");
    });
    const b = wedopyTask.spawn(async () => {
      order.push("b1");
      await wedopyTask.wait(0.04);
      order.push("b2");
    });
    await Promise.all([a.join(), b.join()]);
    // b termina antes que a: el planificador respeta los plazos
    expect(order.indexOf("b2")).toBeLessThan(order.indexOf("a2"));
  });

  it("cancel aborta la espera pendiente de la tarea (TaskCancelled)", async () => {
    await setup();
    let cancelled = false;
    const t = wedopyTask.spawn(async (ctx) => {
      try {
        await ctx.wait(10);
      } catch (exc) {
        cancelled = exc instanceof TaskCancelled || exc?.name === "TaskCancelled";
      }
    });
    await sleep(0.05);
    t.cancel();
    await t.join();
    expect(cancelled).toBe(true);
  });

  it("la cancelación es persistente: los puntos cooperativos posteriores fallan", async () => {
    await setup();
    const notes = [];
    const t = wedopyTask.spawn(async (ctx) => {
      try {
        try {
          await ctx.wait(10);
        } catch { /* se captura pero no se relanza */ }
        await ctx.wait(0.01); // debe fallar otra vez
      } catch (exc) {
        notes.push(exc?.name);
      }
    });
    await sleep(0.05);
    t.cancel();
    await t.join();
    expect(notes).toEqual(["TaskCancelled"]);
  });

  it("cancel de una tarea ya terminada no hace nada", async () => {
    await setup();
    const t = wedopyTask.spawn(async () => { await wedopyTask.wait(0.01); });
    await t.join();
    expect(() => t.cancel()).not.toThrow();
  });

  it("wait del flujo principal suspende sin bloquear el planificador", async () => {
    await setup();
    const started = Date.now();
    await wedopyTask.wait(0.12);
    expect(Date.now() - started).toBeGreaterThanOrEqual(90);
  });

  it("wait valida el argumento", async () => {
    await setup();
    await expect(wedopyTask.wait(-1)).rejects.toThrow(RangeError);
    await expect(wedopyTask.wait("1")).rejects.toThrow(TypeError);
  });
});
