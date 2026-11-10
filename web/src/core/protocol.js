// Codecs del protocolo WeDo 2.0. Equivalentes a los codecs de wedopy_core/_wedopy.pyx
// y a wedopy_core/protocol/uuid.py. Los vectores de prueba proceden de tests/test_protocol.py.
import * as K from "./constants.js";
import { pyRound } from "./util.js";

export const TILT_DIRECTIONS = Object.freeze({ 0: "neutral", 3: "back", 5: "right", 7: "left", 9: "forward" });

// -- Comandos -----------------------------------------------------------------

/** Comando de salida `[conn, 01, 01, int8(speed)]`. La velocidad se acota a -100..100. */
export function motorPower(conn, speed) {
  const s = Math.max(-100, Math.min(100, speed));
  return Uint8Array.of(conn, 0x01, 0x01, s & 0xff);
}

/** Color predefinido (el LED debe estar en modo discreto). */
export const ledIndex = (index) => Uint8Array.of(K.CONN_RGB, 0x04, 0x01, index);

/** Color absoluto (el LED debe estar en modo absoluto). */
export const ledRgb = (r, g, b) => Uint8Array.of(K.CONN_RGB, 0x04, 0x03, r, g, b);

/** Comando de entrada `[01 02 conn type mode delta(4, LE) unit notify]` (11 bytes). */
export function inputFormat(conn, type, mode, delta, unit, notify) {
  const out = new Uint8Array(11);
  const dv = new DataView(out.buffer);
  out[0] = 0x01; out[1] = 0x02; out[2] = conn; out[3] = type; out[4] = mode;
  dv.setUint32(5, delta, true);
  out[9] = unit;
  out[10] = notify ? 1 : 0;
  return out;
}

/** La señal "start sensor working" vista en las capturas. */
export const inputStart = (conn) => Uint8Array.of(0x00, 0x01, conn);

// -- Notificaciones -----------------------------------------------------------

/** `[conn 00]` (desconexión) o `[conn 01 hub_index type ...]` (conexión). */
export function parsePortEvent(data) {
  if (data.length < 2) throw new RangeError(`port event too short (${data.length} bytes)`);
  const conn = data[0];
  const attached = data[1] === 1;
  if (!attached) return { conn, attached: false, hubIndex: 0, type: 0 };
  if (data.length < 4) throw new RangeError(`attach event too short (${data.length} bytes)`);
  return { conn, attached: true, hubIndex: data[2], type: data[3] };
}

/** `[?, conn, value...]`. El primer byte no está documentado y se deja sin interpretar. */
export function parseSample(data) {
  if (data.length < 2) throw new RangeError(`sensor value too short (${data.length} bytes)`);
  const raw = Uint8Array.from(data);
  return { conn: raw[1], value: raw.slice(2), raw };
}

const view = (bytes) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

/** 1 byte = uint8, 2 = uint16 LE, 4 = float32 LE. */
export function decodeScalar(value) {
  switch (value.length) {
    case 1: return value[0];
    case 2: return view(value).getUint16(0, true);
    case 4: return view(value).getFloat32(0, true);
    default: throw new RangeError(`cannot decode a ${value.length}-byte sensor value`);
  }
}

/** Modo ángulo: dos float32 (8 bytes) o dos int8. Devuelve enteros redondeados [x, y]. */
export function decodeTiltAngle(value) {
  if (value.length === 8) {
    const dv = view(value);
    const x = dv.getFloat32(0, true);
    const y = dv.getFloat32(4, true);
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new RangeError("non-finite tilt angle");
    return [pyRound(x), pyRound(y)];
  }
  if (value.length < 2) throw new RangeError(`tilt angle value too short (${value.length} bytes)`);
  const dv = view(value);
  return [dv.getInt8(0), dv.getInt8(1)];
}

export function tiltDirectionName(value) {
  const code = decodeScalar(value);
  if (!Number.isFinite(code)) return "unknown";
  return TILT_DIRECTIONS[Math.trunc(code)] ?? "unknown";
}

// -- UUID ---------------------------------------------------------------------

/** Acepta `0x1523`, `1523` o un UUID completo; devuelve la forma canónica de 128 bits en minúsculas. */
export function normalizeUuid(text) {
  let s = String(text).trim().toLowerCase();
  if (s.startsWith("0x")) s = s.slice(2);
  if (!s.includes("-") && s.length <= 8) {
    if (!/^[0-9a-f]+$/.test(s)) throw new RangeError(`invalid UUID '${s}'`);
    return `${parseInt(s, 16).toString(16).padStart(8, "0")}${K.STD_SUFFIX}`;
  }
  const c = s.replaceAll("-", "");
  if (!/^[0-9a-f]+$/.test(c) || c.length !== 32) throw new RangeError(`invalid UUID '${s}'`);
  return `${c.slice(0, 8)}-${c.slice(8, 12)}-${c.slice(12, 16)}-${c.slice(16, 20)}-${c.slice(20)}`;
}
