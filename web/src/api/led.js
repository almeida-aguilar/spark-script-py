// Built-in LED (equivalent to src/wedopy/led.py). Indexed colours (0..10) and RGB are
// different hub modes; the coordinator keeps track of which one is active.

// Indexed colours of the Smart Hub LED (discrete mode), as the firmware really maps them
// (checked on hardware): 0 off, 1 pink, 2 purple, 3 blue, 4 cyan/light blue, 5 light green,
// 6 green, 7 yellow, 8 orange, 9 red, 10 white.
// Note that index 5 is the light green and 6 the pure green, so from 5 on everything is
// shifted by one compared with the table in LEGO's documentation (which omits the light
// green and adds a grey the firmware does not have).
export const OFF = 0, BLACK = 0,
  PINK = 1, ROSE = 1,
  PURPLE = 2, VIOLET = 2,
  BLUE = 3,
  CYAN = 4, LIGHT_BLUE = 4, SKY_BLUE = 4,
  LIGHT_GREEN = 5, TEAL = 5,
  GREEN = 6, DARK_GREEN = 6,
  YELLOW = 7,
  ORANGE = 8,
  RED = 9,
  WHITE = 10, BRIGHT_WHITE = 10;

const COLORS = {
  OFF, BLACK, PINK, ROSE, PURPLE, VIOLET, BLUE, CYAN, LIGHT_BLUE, SKY_BLUE, LIGHT_GREEN, TEAL,
  GREEN, DARK_GREEN, YELLOW, ORANGE, RED, WHITE, BRIGHT_WHITE,
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

// Constantes de color también como propiedades estáticas (LED.RED, LED.GREEN, ...).
// La API es en inglés (igual que la biblioteca Python); las etiquetas de la UI van en español.
Object.assign(LED, COLORS);
export const LED_COLORS = Object.freeze({ ...COLORS });
