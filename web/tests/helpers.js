import { Hub } from "../src/api/hub.js";
import { makeTiming } from "../src/core/timing.js";
import { SimulatedTransport } from "../src/transport/simulated.js";

// Perfil rápido, igual que FAST de tests/helpers.py de la biblioteca Python.
export const FAST = makeTiming({
  heartbeatInterval: 0.05, watchdogTimeout: 0.3, emergencyAttemptTimeout: 0.1, opTimeout: 0.2,
  sensorTimeout: 0.3, settleQuiet: 0.12, settleMax: 1.0, connectTimeout: 2.0, poll: 0.01,
});

export function makeHub(devices, simOptions = {}, timing = FAST) {
  const sim = new SimulatedTransport(devices, { externalDelay: 0.03, ...simOptions });
  const hub = new Hub({ transport: sim, timing });
  return { hub, sim };
}

export const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));

export async function waitFor(predicate, timeout = 2.0, step = 0.01) {
  const end = performance.now() + timeout * 1000;
  while (performance.now() < end) {
    if (predicate()) return true;
    await sleep(step);
  }
  return predicate();
}

export const coreOf = (hub) => hub._session.core;
