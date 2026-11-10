// Parámetros de temporización. Valores en SEGUNDOS, idénticos a
// wedopy_core/runtime/timing.py (verificados contra el original).

export const DEFAULT_TIMING = Object.freeze({
  heartbeatInterval: 0.5, // lectura de batería mientras un motor está activo
  watchdogTimeout: 2.0, // sin ACK válido durante este tiempo -> parada de emergencia
  emergencyAttempts: 2,
  emergencyAttemptTimeout: 0.5,
  opTimeout: 1.0, // límite por operación
  sensorTimeout: 1.0, // espera del primer valor tras configurar un sensor
  settleQuiet: 1.5, // connect(): sin eventos de puerto nuevos durante este tiempo
  settleMax: 5.0, // connect(): tope duro del descubrimiento de puertos
  connectTimeout: 15.0, // conexión GATT + descubrimiento (sin contar el selector del navegador)
  poll: 0.02, // periodo del bucle del watchdog
});

export function makeTiming(overrides = {}) {
  return Object.freeze({ ...DEFAULT_TIMING, ...overrides });
}
