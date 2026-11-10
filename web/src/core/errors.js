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
