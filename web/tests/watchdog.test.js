// Escenarios de tests/test_safety.py de la biblioteca Python, portados a la versión web.
import { describe, expect, it } from "vitest";
import * as K from "../src/core/constants.js";
import { BLEError, NotConnectedError } from "../src/core/errors.js";
import { HubState } from "../src/core/state-machine.js";
import { Coordinator } from "../src/core/coordinator.js";
import { task as wedoTask } from "../src/api/tasks.js";
import { coreOf, makeHub, sleep, waitFor, FAST } from "./helpers.js";

function captureLog(hub) {
  const messages = [];
  hub.subscribe((type, d) => { if (type === "log") messages.push(d.message); });
  return messages;
}

describe("watchdog y seguridad", () => {
  it("para los motores cuando falla el heartbeat pero las escrituras funcionan", async () => {
    const { hub, sim } = makeHub();
    const log = captureLog(hub);
    hub.connect();
    await hub.waitConnection(5);
    try {
      await hub.motor("A").run(60);
      expect(sim.motors[1]).toBe(60);
      sim.failReads = true; // el heartbeat (lectura de batería) falla
      expect(await waitFor(() => coreOf(hub).state === HubState.ERROR, 3.0)).toBe(true);
      expect(sim.motors[1]).toBe(0); // la parada de emergencia llegó al hub
      expect(log.some((m) => m.includes("motors stopped"))).toBe(true);
      expect(log.some((m) => m.includes("stop attempt 1 ACK"))).toBe(true);
    } finally { await hub.disconnect(); }
  });

  it("informa de parada NO confirmada cuando el hub deja de responder", async () => {
    const { hub, sim } = makeHub();
    const log = captureLog(hub);
    hub.connect();
    await hub.waitConnection(5);
    try {
      await hub.motor("A").run(60);
      sim.freeze();
      expect(await waitFor(() => coreOf(hub).state === HubState.ERROR, 4.0)).toBe(true);
      expect(log.some((m) => m.includes("stop NOT confirmed (2 attempts)"))).toBe(true);
      sim.unfreeze();
      expect(() => hub.motor("a").run(1)).toThrow(NotConnectedError); // errores explícitos, nada se oculta
    } finally { await hub.disconnect(); }
  });

  it("no genera tráfico de heartbeat con los motores parados", async () => {
    const { hub, sim } = makeHub();
    hub.connect();
    await hub.waitConnection(5);
    try {
      await sleep(0.4);
      expect(sim.reads).not.toContain(K.CHAR_BATTERY);
      await hub.motor("A").run(20);
      expect(await waitFor(() => sim.reads.includes(K.CHAR_BATTERY), 1.0)).toBe(true);
      await hub.motor("A").stop();
    } finally { await hub.disconnect(); }
  });

  it("la pérdida de enlace pasa a ERROR y toda operación falla explícitamente", async () => {
    const { hub, sim } = makeHub({ A: "motor", B: "distance" });
    hub.connect();
    await hub.waitConnection(5);
    const motor = hub.motor("A");
    await motor.run(50);
    sim.dropLink();
    expect(await waitFor(() => coreOf(hub).state === HubState.ERROR)).toBe(true);
    expect(hub.isConnected).toBe(false);
    expect(() => motor.run(10)).toThrow(NotConnectedError);
    expect(() => hub.led.color("red")).toThrow(NotConnectedError);
    expect(() => hub.button.read()).toThrow(NotConnectedError);
    await hub.disconnect(); // limpia una conexión fallida sin excepción
    expect(coreOf(hub).state).toBe(HubState.DISCONNECTED);
  });

  it("disconnect con un hub mudo informa de parada sin confirmar", async () => {
    const { hub, sim } = makeHub();
    hub.connect();
    await hub.waitConnection(5);
    await hub.motor("A").run(50);
    sim.freeze();
    const confirmed = await coreOf(hub).disconnect();
    expect(confirmed).toBe(false);
    expect(coreOf(hub).state).toBe(HubState.DISCONNECTED);
  });

  it("las peticiones de emergencia se ejecutan antes que las normales encoladas", async () => {
    const { hub } = makeHub();
    hub.connect();
    await hub.waitConnection(5);
    try {
      const c = coreOf(hub);
      const order = [];
      let release;
      const gate = new Promise((r) => { release = r; });
      const reqs = [c._enqueue(async () => { await gate; order.push("blocker"); }, { needsConnected: false })];
      await sleep(0.01);
      reqs.push(c._enqueue(() => order.push("n1"), { needsConnected: false }));
      reqs.push(c._enqueue(() => order.push("n2"), { needsConnected: false }));
      reqs.push(c._enqueue(() => order.push("emergency"), { emergency: true, needsConnected: false }));
      release();
      await Promise.all(reqs.map((r) => r.promise));
      expect(order).toEqual(["blocker", "emergency", "n1", "n2"]);
    } finally { await hub.disconnect(); }
  });

  it("el escritor único serializa llamadores concurrentes", async () => {
    const { hub, sim } = makeHub({ A: "motor", B: "motor" }, { ackDelay: 0.005 });
    hub.connect();
    await hub.waitConnection(5);
    try {
      let inFlight = 0; let maxInFlight = 0;
      const original = sim.write.bind(sim);
      sim.write = async (...a) => {
        inFlight += 1; maxInFlight = Math.max(maxInFlight, inFlight);
        try { return await original(...a); } finally { inFlight -= 1; }
      };
      const spam = async (port, speed) => { for (let i = 0; i < 10; i += 1) await hub.motor(port).run(speed); };
      await Promise.all([spam("A", 10), spam("B", 20)]);
      expect(sim.writesTo(K.CHAR_OUTPUT_CMD)).toHaveLength(20);
      expect(maxInFlight).toBe(1); // nunca dos escrituras BLE simultáneas
    } finally { await hub.disconnect(); }
  });

  it("stopAll sigue tras un fallo y lo informa", async () => {
    const { hub, sim } = makeHub({ A: "motor", B: "motor" });
    hub.connect();
    await hub.waitConnection(5);
    try {
      await hub.motor("A").run(30);
      await hub.motor("B").run(30);
      const original = sim.write.bind(sim);
      sim.write = async (uuid, data, timeout) => {
        if (uuid === K.CHAR_OUTPUT_CMD && data[0] === K.CONN_PORT_A) throw new BLEError("simulated write failure");
        return original(uuid, data, timeout);
      };
      await expect(hub.stopAll()).rejects.toBeInstanceOf(BLEError);
      expect(sim.motors[2]).toBe(0); // B se paró igualmente
      sim.write = original;
    } finally { await hub.disconnect(); }
  });

  it("rechaza una transición de estado inválida", () => {
    const { sim } = makeHub();
    const c = new Coordinator(sim);
    expect(() => c._sm.transition(HubState.CONNECTED)).toThrow(/invalid hub state transition/);
  });

  it("no ejecuta órdenes antiguas tras reconectar", async () => {
    const { hub, sim } = makeHub({ A: "motor" }, { ackDelay: 0.05 });
    hub.connect();
    await hub.waitConnection(5);
    const c = coreOf(hub);
    const motor = hub.motor("A");
    const stale = [motor.run(10), motor.run(20), motor.run(30)]; // encoladas
    stale.forEach((p) => p.catch(() => {}));
    await sleep(0.01);
    const before = sim.writesTo(K.CHAR_OUTPUT_CMD).length;
    await c.disconnect(); // cierra el worker y rechaza lo pendiente
    const results = await Promise.allSettled(stale);
    expect(results.slice(1).every((r) => r.status === "rejected")).toBe(true);
    const sentAfterClose = sim.writesTo(K.CHAR_OUTPUT_CMD).slice(before).map((d) => d[3]);
    expect(sentAfterClose.filter((v) => v === 20 || v === 30)).toEqual([]);
    hub.connect();
    await hub.waitConnection(5); // reconexión
    expect(sim.writesTo(K.CHAR_OUTPUT_CMD).slice(before).map((d) => d[3]).filter((v) => v === 20 || v === 30)).toEqual([]);
    await hub.disconnect();
  });

  it("el watchdog es independiente del planificador de tareas", async () => {
    const { hub, sim } = makeHub();
    hub.connect();
    await hub.waitConnection(5);
    const seen = [];
    const t = wedoTask.spawn(async () => {
      await hub.motor("A").run(50);
      sim.failReads = true;
      await sleep(1.0); // espera larga sin ceder al planificador de tareas
      seen.push(sim.motors[1]); // el watchdog actuó mientras tanto
    });
    await t.join();
    try {
      expect(seen).toEqual([0]);
      expect(coreOf(hub).state).toBe(HubState.ERROR);
    } finally { await hub.disconnect(); }
  });

  it("usa los valores de seguridad del original", () => {
    expect(FAST.emergencyAttempts).toBe(2);
    expect(Coordinator.STOP_PROFILE).toBe("nobarrier");
  });
});
