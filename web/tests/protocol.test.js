// Vectores de tests/test_protocol.py de la biblioteca Python (capturas BLED112 sin el entramado).
import { describe, expect, it } from "vitest";
import * as K from "../src/core/constants.js";
import {
  decodeScalar, decodeTiltAngle, inputFormat, inputStart, ledIndex, ledRgb, motorPower,
  normalizeUuid, parsePortEvent, parseSample, tiltDirectionName,
} from "../src/core/protocol.js";
import { pyRound } from "../src/core/util.js";

const hex = (s) => Uint8Array.from(s.match(/../g) ?? [], (h) => parseInt(h, 16));
const f32 = (...xs) => {
  const b = new Uint8Array(4 * xs.length);
  xs.forEach((x, i) => new DataView(b.buffer).setFloat32(i * 4, x, true));
  return b;
};

describe("comandos", () => {
  it("coincide con los vectores capturados", () => {
    expect(motorPower(1, -87)).toEqual(hex("010101a9"));
    expect(motorPower(1, 500)).toEqual(Uint8Array.of(1, 1, 1, 100));
    expect(motorPower(2, -500)).toEqual(Uint8Array.of(2, 1, 1, 0x9c));
    expect(motorPower(1, 0)).toEqual(Uint8Array.of(1, 1, 1, 0));
    expect(ledIndex(4)).toEqual(hex("06040104"));
    expect(ledRgb(0, 0xff, 0x40)).toEqual(hex("06040300ff40"));
    expect(inputStart(2)).toEqual(hex("000102"));
    expect(inputStart(1)).toEqual(hex("000101"));
  });

  it("codifica el formato de entrada (11 bytes, delta little-endian)", () => {
    expect(inputFormat(1, K.TYPE_TILT, 1, 1, K.UNIT_SI, true)).toEqual(hex("0102012201010000000201"));
    expect(inputFormat(K.CONN_RGB, K.TYPE_RGB, K.LED_DISCRETE, 1, K.UNIT_RAW, true)).toEqual(hex("0102061701010000000001"));
  });
});

describe("notificaciones", () => {
  it("decodifica eventos de puerto", () => {
    let ev = parsePortEvent(Uint8Array.of(0x01, 0x01, 0x00, 0x22, 0, 0, 0, 0x10, 0, 0, 0, 0x10));
    expect([ev.conn, ev.attached, ev.type]).toEqual([1, true, K.TYPE_TILT]);
    ev = parsePortEvent(Uint8Array.of(0x02, 0x00));
    expect([ev.conn, ev.attached]).toEqual([2, false]);
    for (const bad of [[0x01], [], [0x01, 0x01, 0x00]]) {
      expect(() => parsePortEvent(Uint8Array.from(bad))).toThrow(RangeError);
    }
  });

  it("decodifica muestras y escalares", () => {
    const s = parseSample(Uint8Array.of(0x03, 0x02, 0x00, 0x00, 0xa0, 0x40));
    expect(s.conn).toBe(2);
    expect(decodeScalar(s.value)).toBe(5.0);
    expect(decodeScalar(Uint8Array.of(7))).toBe(7);
    expect(decodeScalar(Uint8Array.of(1, 1))).toBe(257);
    expect(() => decodeScalar(Uint8Array.of(1, 2, 3))).toThrow(RangeError);
  });

  it("decodifica la inclinación", () => {
    expect(decodeTiltAngle(Uint8Array.of(0xfb, 0x0a))).toEqual([-5, 10]);
    expect(decodeTiltAngle(f32(12.4, -30.6))).toEqual([12, -31]);
    expect(() => decodeTiltAngle(f32(NaN, 1))).toThrow(RangeError);
    const names = { 0: "none", 3: "backward", 5: "right", 7: "left", 9: "forward" };
    for (const [code, name] of Object.entries(names)) expect(tiltDirectionName(f32(Number(code)))).toBe(name);
    expect(tiltDirectionName(f32(4))).toBe("unknown");
  });
});

describe("UUID", () => {
  it("normaliza y coincide con las constantes", () => {
    expect(normalizeUuid("0x1523")).toBe("00001523-0000-1000-8000-00805f9b34fb");
    expect(normalizeUuid("2A19")).toBe("00002a19-0000-1000-8000-00805f9b34fb");
    expect(normalizeUuid(K.SERVICE_HUB)).toBe(K.SERVICE_HUB);
    expect(K.SERVICE_HUB).toBe("00001523-1212-efde-1523-785feabcd123");
    expect(K.CHAR_OUTPUT_CMD).toBe("00001565-1212-efde-1523-785feabcd123");
    expect(K.CHAR_BATTERY).toBe("00002a19-0000-1000-8000-00805f9b34fb");
    for (const bad of ["zz", "1234-5678", ""]) expect(() => normalizeUuid(bad)).toThrow(RangeError);
  });
});

describe("redondeo equivalente a Python", () => {
  it("usa half-to-even como round()", () => {
    expect([0.5, 1.5, 2.5, 3.5, -0.5, -1.5, -2.5].map(pyRound)).toEqual([0, 2, 2, 4, 0, -2, -2]);
    expect(pyRound(12.4)).toBe(12);
    expect(pyRound(-30.6)).toBe(-31);
  });
});
