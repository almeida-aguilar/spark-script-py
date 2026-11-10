// LED integrado del hub (API v0.2.0): `hub.led`.
//
//   hub.led.color("light_green")   # color predefinido por nombre
//   hub.led.color(255, 0, 0)       # color absoluto (canales 0..255, enteros)
//
// Los colores predefinidos son los once nombres de la paleta del dispositivo (los índices
// internos son un detalle del firmware, comprobado en hardware: el 5 es el verde claro y
// el 6 el verde oscuro/puro). No hay alias: un nombre desconocido es un error. La paleta
// la determina el dispositivo, así que color("red") no tiene por qué coincidir con
// color(255, 0, 0).
export const LED_COLORS = Object.freeze({
  off: 0,
  pink: 1,
  purple: 2,
  blue: 3,
  light_blue: 4,
  light_green: 5,
  dark_green: 6,
  yellow: 7,
  orange: 8,
  red: 9,
  white: 10,
});

const COLOR_LIST = Object.keys(LED_COLORS).join(", ");

function checkChannel(name, value, port = null) {
  const label = `led${port ? ` (puerto "${port}")` : ""}`;
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new TypeError(`${label}: color esperaba un entero y recibió ${typeof value}`);
  }
  if (value < 0 || value > 255) {
    throw new RangeError(`${label}: el valor ${value} está fuera del rango 0..255`);
  }
  return value;
}

export class LED {
  constructor(session) { this._session = session; }

  /** Color predefinido por nombre ("light_green"…) o color absoluto (r, g, b). */
  color(nameOrRed, green, blue) {
    this._session.requireUsable();
    if (nameOrRed === undefined || nameOrRed === null) {
      throw new TypeError("led: color esperaba un nombre o tres canales RGB");
    }
    if (typeof nameOrRed === "string") {
      if (green !== undefined || blue !== undefined) {
        throw new TypeError("led: color admite un nombre o tres canales RGB, no ambos");
      }
      const index = LED_COLORS[nameOrRed.toLowerCase()];
      if (index === undefined) {
        throw new RangeError(`led: color "${nameOrRed}" no válido (colores válidos: ${COLOR_LIST})`);
      }
      return this._session.core.ledIndex(index);
    }
    if (green === undefined || blue === undefined) {
      throw new TypeError("led: color esperaba un nombre o tres canales RGB");
    }
    return this._session.core.ledRgb(
      checkChannel("red", nameOrRed),
      checkChannel("green", green),
      checkChannel("blue", blue),
    );
  }

  toString() { return "LED()"; }
}
