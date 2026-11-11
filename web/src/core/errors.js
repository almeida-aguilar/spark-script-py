// Jerarquía de excepciones equivalente a wedopy_core/exceptions.py.
// Los errores de argumentos de Python (TypeError/ValueError) se mantienen como
// TypeError y RangeError en JavaScript.
//
// `errorName` es explícito (no `new.target.name`) porque el minificador del build de
// producción renombra las clases; el nombre se usa para traducir errores a Python y en la UI.

export class WedoError extends Error {
  static errorName = "WedoError";
  constructor(message, options) {
    super(message, options);
    this.name = new.target.errorName;
  }
}
export class BLEError extends WedoError { static errorName = "BLEError"; }
export class HubConnectionError extends WedoError { static errorName = "HubConnectionError"; }
export class HubDisconnectedError extends HubConnectionError { static errorName = "HubDisconnectedError"; }
export class OperationTimeout extends WedoError { static errorName = "OperationTimeout"; }
export class HubBusyError extends WedoError { static errorName = "HubBusyError"; }
export class DeviceNotFoundError extends WedoError { static errorName = "DeviceNotFoundError"; }
export class DeviceTypeError extends WedoError { static errorName = "DeviceTypeError"; }
export class AmbiguousDeviceError extends WedoError { static errorName = "AmbiguousDeviceError"; }
export class InvalidStateError extends WedoError { static errorName = "InvalidStateError"; }
export class UnsupportedFeatureError extends WedoError { static errorName = "UnsupportedFeatureError"; }

// -- Excepciones públicas de la API v0.3.0 (ver docs de la API) ----------------------
// `NotConnectedError`: se usa un recurso con el hub desconectado, o se pierde la conexión
// durante una espera. Sustituye a HubDisconnectedError / InvalidStateError en la API pública.
export class NotConnectedError extends WedoError { static errorName = "NotConnectedError"; }
// `ConnectionFailedError`: el intento de conexión falló o fue rechazado.
export class ConnectionFailedError extends WedoError { static errorName = "ConnectionFailedError"; }
// `PortError`: el puerto está vacío o tiene un periférico de otro tipo.
export class PortError extends WedoError { static errorName = "PortError"; }
// `NoReadingError`: todavía no hay una lectura válida del dispositivo.
export class NoReadingError extends WedoError { static errorName = "NoReadingError"; }
// `KeyboardUnavailableError`: el entorno no puede entregar eventos de teclado.
export class KeyboardUnavailableError extends WedoError { static errorName = "KeyboardUnavailableError"; }
// `TaskCancelled`: una tarea fue cancelada (cooperativa). No deriva de WedoError, como
// `TaskCancelled(BaseException)` en Python: un manejo de error genérico no la captura.
export class TaskCancelled extends Error {
  static errorName = "TaskCancelled";
  constructor(message = "task cancelled") {
    super(message);
    this.name = new.target.errorName;
  }
}
