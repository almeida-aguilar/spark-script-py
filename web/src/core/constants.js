// Constantes del protocolo WeDo 2.0.
// Fuente: wedo_core/protocol/constants.py y uuid.py (sin modificar valores).

export const HUB_SUFFIX = "-1212-efde-1523-785feabcd123";
export const STD_SUFFIX = "-0000-1000-8000-00805f9b34fb";

const hex4 = (n) => n.toString(16).padStart(4, "0");
export const hubUuid = (short) => `0000${hex4(short)}${HUB_SUFFIX}`;
export const stdUuid = (short) => `0000${hex4(short)}${STD_SUFFIX}`;

// Servicios
export const SERVICE_GAP = stdUuid(0x1800);
export const SERVICE_DEVICE_INFO = stdUuid(0x180a);
export const SERVICE_BATTERY = stdUuid(0x180f);
export const SERVICE_HUB = hubUuid(0x1523);
export const SERVICE_IO = hubUuid(0x4f0e);

// Características estándar
export const CHAR_BATTERY = stdUuid(0x2a19);

// Servicio del hub 0x1523
export const CHAR_HUB_NAME = hubUuid(0x1524);
export const CHAR_BUTTON = hubUuid(0x1526);
export const CHAR_PORT = hubUuid(0x1527);
export const CHAR_LOW_VOLTAGE = hubUuid(0x1528);
export const CHAR_HIGH_CURRENT = hubUuid(0x1529);
export const CHAR_LOW_SIGNAL = hubUuid(0x152a);
export const CHAR_TURN_OFF = hubUuid(0x152b);
export const CHAR_DISCONNECT = hubUuid(0x152e);

// Servicio I/O 0x4f0e
export const CHAR_SENSOR = hubUuid(0x1560);
export const CHAR_FORMAT = hubUuid(0x1561);
export const CHAR_INPUT_CMD = hubUuid(0x1563);
export const CHAR_OUTPUT_CMD = hubUuid(0x1565);

// Connect IDs
export const CONN_PORT_A = 0x01;
export const CONN_PORT_B = 0x02;
export const CONN_CURRENT = 0x03;
export const CONN_VOLTAGE = 0x04;
export const CONN_PIEZO = 0x05;
export const CONN_RGB = 0x06;

// Tipos de dispositivo
export const TYPE_MOTOR = 0x01;
export const TYPE_VOLTAGE = 0x14;
export const TYPE_CURRENT = 0x15;
export const TYPE_PIEZO = 0x16;
export const TYPE_RGB = 0x17;
export const TYPE_TILT = 0x22;
export const TYPE_MOTION = 0x23; // el sensor de "distancia"
export const TYPE_GENERIC = 0x24;

// Unidades del comando de formato de entrada
export const UNIT_RAW = 0;
export const UNIT_PERCENT = 1;
export const UNIT_SI = 2;

// Modos del LED RGB
export const LED_ABSOLUTE = 0;
export const LED_DISCRETE = 1;

// Modos del sensor de inclinación (bump no está expuesto)
export const TILT_ANGLE = 0;
export const TILT_DIRECTION = 1;

// Modos del sensor de distancia (count no está expuesto)
export const DISTANCE_DETECT = 0;

export const TYPE_NAMES = Object.freeze({
  [TYPE_MOTOR]: "motor",
  [TYPE_VOLTAGE]: "voltage",
  [TYPE_CURRENT]: "current",
  [TYPE_PIEZO]: "piezo",
  [TYPE_RGB]: "rgb-led",
  [TYPE_TILT]: "tilt",
  [TYPE_MOTION]: "distance",
  [TYPE_GENERIC]: "generic",
});

// Características que el hub debe exponer para que wedo funcione.
export const REQUIRED_CHARS = Object.freeze([
  CHAR_BATTERY, CHAR_PORT, CHAR_SENSOR, CHAR_INPUT_CMD, CHAR_OUTPUT_CMD,
]);

// Nombre anunciado por el hub (BleakTransport._WEDO_NAMES).
export const WEDO_NAMES = Object.freeze(["LPF2 Smart Hub 2 I/O"]);
