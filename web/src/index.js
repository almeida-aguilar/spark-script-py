// API pública de wedo Web. Espejo de src/wedo/__init__.py (nombres en camelCase).
export { Hub } from "./api/hub.js";
export { Motor } from "./api/motor.js";
export { DistanceSensor, TiltSensor, TiltAxis } from "./api/sensors.js";
export { Button } from "./api/button.js";
export { LED, LED_COLORS } from "./api/led.js";
export { TaskManager, TaskProtocol, Task, TaskCancelled, task } from "./api/tasks.js";
export { Key, KeyboardCapture, KEY_LIST, key, releaseKeyboard, resetKeyboard } from "./api/keyboard.js";
export * from "./core/errors.js";
export { HubState } from "./core/state-machine.js";
export { DEFAULT_TIMING, makeTiming } from "./core/timing.js";
export { SimulatedTransport } from "./transport/simulated.js";
export {
  WebBluetoothTransport, isWebBluetoothSupported, webBluetoothProblem,
} from "./transport/web-bluetooth.js";
export { Transport } from "./transport/interfaces.js";
