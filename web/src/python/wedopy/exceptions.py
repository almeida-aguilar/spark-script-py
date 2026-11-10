"""Excepciones públicas (idénticas a wedopy_core/exceptions.py de la biblioteca Python)."""


class WedoError(Exception):
    pass


class BLEError(WedoError, OSError):
    pass


class HubConnectionError(WedoError, ConnectionError):
    pass


class HubDisconnectedError(HubConnectionError):
    pass


class OperationTimeout(WedoError, TimeoutError):
    pass


class HubBusyError(WedoError, RuntimeError):
    pass


class DeviceNotFoundError(WedoError, LookupError):
    pass


class DeviceTypeError(WedoError):
    pass


class AmbiguousDeviceError(WedoError, LookupError):
    pass


class InvalidStateError(WedoError, RuntimeError):
    pass


class UnsupportedFeatureError(WedoError, NotImplementedError):
    pass
