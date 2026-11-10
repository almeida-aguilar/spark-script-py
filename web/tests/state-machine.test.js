import { describe, expect, it } from "vitest";
import { InvalidStateError } from "../src/core/errors.js";
import { HubState as S, StateMachine, TRANSITIONS } from "../src/core/state-machine.js";

describe("StateMachine", () => {
  it("rechaza transiciones inválidas", () => {
    const sm = new StateMachine();
    expect(() => sm.transition(S.CONNECTED)).toThrow(InvalidStateError);
  });

  it("recorre el ciclo normal y notifica cambios", () => {
    const seen = [];
    const sm = new StateMachine((s) => seen.push(s));
    sm.transition(S.CONNECTING); sm.transition(S.CONNECTED); sm.transition(S.DISCONNECTING); sm.transition(S.DISCONNECTED);
    expect(seen).toEqual(["connecting", "connected", "disconnecting", "disconnected"]);
  });

  it("forceError solo actúa desde CONNECTED/CONNECTING y conserva la causa", () => {
    const sm = new StateMachine();
    sm.forceError("x");
    expect(sm.state).toBe(S.DISCONNECTED);
    sm.transition(S.CONNECTING); sm.transition(S.CONNECTED);
    sm.forceError("enlace perdido");
    expect([sm.state, sm.error]).toEqual([S.ERROR, "enlace perdido"]);
    sm.transition(S.CONNECTING); // reconexión permitida desde ERROR
    expect(sm.error).toBeNull();
  });

  it("la tabla coincide con la del núcleo Cython", () => {
    expect([...TRANSITIONS[S.SHUTDOWN]].sort()).toEqual(["connecting", "disconnected"]);
    expect([...TRANSITIONS[S.ERROR]].sort()).toEqual(["connecting", "disconnected", "disconnecting"]);
  });
});
