// Teclado (API v0.3.0): key("space") del módulo, Key y la captura compartida.
// Se usa un `target` inyectado (sin jsdom): un EventTarget mínimo que guarda los listeners.
import { afterEach, describe, expect, it } from "vitest";
import { Hub } from "../src/api/hub.js";
import { KeyboardUnavailableError } from "../src/core/errors.js";
import {
  KEY_LIST,
  Key,
  KeyboardCapture,
  eventKeyName,
  key,
  releaseKeyboard,
  resetKeyboard,
} from "../src/api/keyboard.js";

/** EventTarget mínimo que registra los listeners para poder despachar eventos a mano. */
function fakeTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
    },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
    dispatch(type, event) {
      for (const fn of listeners.get(type) ?? []) fn(event);
    },
    count(type) { return listeners.get(type)?.size ?? 0; },
  };
}

const keyEvent = (key, opts = {}) => ({ key, repeat: false, code: opts.code, ...opts });

describe("key (del módulo, v5 §10)", () => {
  it("valida el conjunto cerrado al seleccionar, sin crear un Hub ni conexión", () => {
    expect(key("space").name).toBe("space");
    expect(key("Q").name).toBe("q");
    expect(key("5").name).toBe("5");
    expect(() => key("xx")).toThrow(/tecla "xx" no válida \(teclas válidas: a-z, 0-9/);
    expect(() => key("")).toThrow(/tecla "" no válida/);
    expect(() => key(3)).toThrow(TypeError);
    expect(KEY_LIST).toContain("backspace");
  });

  it("usar una tecla sin entorno de captura lanza KeyboardUnavailableError; seleccionarla no", () => {
    const k = key("space"); // el selector no captura nada
    expect(() => k.read()).toThrow(KeyboardUnavailableError);
    expect(() => k.hasChange()).toThrow(KeyboardUnavailableError);
    expect(() => k.waitChange()).toThrow(KeyboardUnavailableError);
  });

  it("releaseKeyboard() y resetKeyboard() no lanzan sin captura activa", () => {
    expect(() => releaseKeyboard()).not.toThrow();
    expect(() => resetKeyboard()).not.toThrow();
  });
});

describe("Key sobre una captura con target", () => {
  let target;
  afterEach(() => { target = undefined; });
  const setup = () => {
    target = fakeTarget();
    return new KeyboardCapture(target);
  };

  it("read() y has_change() reflejan pulsación y liberación", () => {
    const capture = setup();
    const space = new Key(capture, "space");
    expect(space.read()).toBe(false);
    target.dispatch("keydown", keyEvent(" "));
    expect(space.read()).toBe(true);
    target.dispatch("keyup", keyEvent(" "));
    expect(space.read()).toBe(false);
    expect(space.hasChange("pressed")).toBe(true);
    expect(space.hasChange("pressed")).toBe(false); // ya consumido
    expect(space.hasChange("released")).toBe(true);
  });

  it("la repetición automática y las teclas no capturadas se ignoran", () => {
    const capture = setup();
    const up = new Key(capture, "up");
    up.read(); // activa la captura antes de los eventos
    target.dispatch("keydown", keyEvent("ArrowUp"));
    target.dispatch("keydown", keyEvent("ArrowUp", { repeat: true }));
    target.dispatch("keydown", keyEvent("F5"));
    target.dispatch("keydown", keyEvent("7", { code: "Numpad7" }));
    expect(up.read()).toBe(true);
    expect(up.hasChange("pressed")).toBe(true); // el único registro (la repetición no cuenta)
    expect(up.hasChange()).toBe(false); // ya consumido
  });

  it("perder el foco libera todas las teclas registrando released", () => {
    const capture = setup();
    const a = new Key(capture, "a");
    const left = new Key(capture, "left");
    a.read(); // activa la captura antes de los eventos
    left.read();
    target.dispatch("keydown", keyEvent("a"));
    target.dispatch("keydown", keyEvent("ArrowLeft"));
    expect(a.read() && left.read()).toBe(true);
    target.dispatch("blur", {});
    expect(a.read()).toBe(false);
    expect(left.read()).toBe(false);
    expect(a.hasChange("released")).toBe(true);
    expect(left.hasChange("released")).toBe(true);
  });

  it("dos manejadores de la misma tecla comparten estado y cambios", () => {
    const capture = setup();
    const k1 = new Key(capture, "enter");
    const k2 = new Key(capture, "enter");
    k1.read(); // activa la captura antes de los eventos
    target.dispatch("keydown", keyEvent("Enter"));
    expect(k1.read()).toBe(true);
    expect(k2.read()).toBe(true);
    expect(k1.hasChange("pressed")).toBe(true);
    expect(k2.hasChange("pressed")).toBe(false); // consumido por k1
  });

  it("la captura se activa en el primer uso y release() la desactiva", () => {
    const capture = setup();
    const k = new Key(capture, "a");
    expect(target.count("keydown")).toBe(0);
    k.read();
    expect(target.count("keydown")).toBe(1);
    capture.release();
    expect(target.count("keydown")).toBe(0);
  });

  it("reset() descarta el estado y los cambios pendientes (al iniciar el programa)", () => {
    const capture = setup();
    const a = new Key(capture, "a");
    a.read();
    target.dispatch("keydown", keyEvent("a"));
    expect(a.read()).toBe(true);
    capture.reset();
    expect(a.read()).toBe(false);
    expect(a.hasChange()).toBe(false);
  });
});

describe("el teclado no depende del hub", () => {
  it("usar una tecla no exige conexión del hub", () => {
    const capture = new KeyboardCapture(fakeTarget());
    const space = new Key(capture, "space");
    new Hub({ transport: null }); // sin transporte: nunca conectado
    expect(space.read()).toBe(false);
    expect(() => space.waitChange("pressed")).not.toThrow(); // tampoco NotConnectedError
  });

  it("desconectar el hub no libera ni altera la captura (v5 §10.5)", async () => {
    const target = fakeTarget();
    const capture = new KeyboardCapture(target);
    const a = new Key(capture, "a");
    a.read(); // activa
    target.dispatch("keydown", keyEvent("a"));
    expect(a.read()).toBe(true);
    await new Hub().disconnect();
    expect(capture.active).toBe(true);
    expect(a.read()).toBe(true);
  });
});

describe("eventKeyName", () => {
  it("mapea las teclas del navegador a los nombres de la API", () => {
    expect(eventKeyName(keyEvent("ArrowUp"))).toBe("up");
    expect(eventKeyName(keyEvent("ArrowLeft"))).toBe("left");
    expect(eventKeyName(keyEvent(" "))).toBe("space");
    expect(eventKeyName(keyEvent("Enter"))).toBe("enter");
    expect(eventKeyName(keyEvent("Escape"))).toBe("escape");
    expect(eventKeyName(keyEvent("Backspace"))).toBe("backspace");
    expect(eventKeyName(keyEvent("Shift"))).toBe("shift");
    expect(eventKeyName(keyEvent("A"))).toBe("a"); // con shift pulsado el navegador da mayúscula
    expect(eventKeyName(keyEvent("5"))).toBe("5");
  });

  it("devuelve null para teclas no capturadas y repeticiones", () => {
    expect(eventKeyName(keyEvent("F5"))).toBeNull();
    expect(eventKeyName(keyEvent("MediaPlay"))).toBeNull();
    expect(eventKeyName(keyEvent("a", { repeat: true }))).toBeNull();
    expect(eventKeyName(keyEvent("5", { code: "Numpad5" }))).toBeNull();
  });
});
