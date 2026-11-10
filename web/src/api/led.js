// LED integrado (equivalente a src/wedopy/led.py). Los colores indexados (0..10) y RGB son
// modos distintos del hub; el coordinador registra cuál está activo.

export const OFF = 0, BLACK = 0, PINK = 1, PURPLE = 2, VIOLET = 2, BLUE = 3, CYAN = 4, SKY_BLUE = 4,
  LIGHT_BLUE = 4, GREEN = 5, YELLOW = 6, ORANGE = 7, RED = 8, WHITE = 9, BRIGHT_WHITE = 9,
  DIM_WHITE = 10, SOFT_WHITE = 10;

// Alias en español
export const APAGADO = OFF, ROSA = PINK, MORADO = PURPLE, AZUL = BLUE, CIAN = CYAN, CELESTE = SKY_BLUE,
  VERDE = GREEN, AMARILLO = YELLOW, NARANJA = ORANGE, ROJO = RED, BLANCO = WHITE, BLANCO_TENUE = DIM_WHITE;

const COLORS = {
  OFF, BLACK, PINK, PURPLE, VIOLET, BLUE, CYAN, SKY_BLUE, LIGHT_BLUE, GREEN, YELLOW, ORANGE, RED, WHITE,
  BRIGHT_WHITE, DIM_WHITE, SOFT_WHITE, APAGADO, ROSA, MORADO, AZUL, CIAN, CELESTE, VERDE, AMARILLO,
  NARANJA, ROJO, BLANCO, BLANCO_TENUE,
};

function byte(name, value, hi) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new TypeError(`${name} must be an integer, not ${typeof value}`);
  }
  if (value < 0 || value > hi) throw new RangeError(`${name} must be in 0..${hi}, got ${value}`);
  return value;
}

export class LED {
  constructor(session) { this._session = session; }

  /** Blanco. */
  on() { return this.rgb(255, 255, 255); }
  off() { return this.rgb(0, 0, 0); }

  index(index) {
    return this._session.core.ledIndex(byte("index", index, 10));
  }

  rgb(red, green, blue) {
    return this._session.core.ledRgb(byte("red", red, 255), byte("green", green, 255), byte("blue", blue, 255));
  }
}

// Constantes de color también como propiedades estáticas (LED.RED, LED.ROJO, ...).
Object.assign(LED, COLORS);
export const LED_COLORS = Object.freeze({ ...COLORS });
