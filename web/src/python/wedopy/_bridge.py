"""Puente síncrono entre la API Python de wedopy y la API JavaScript de wedopy Web.

Funciona con Pyodide + JSPI (Chrome >= 137): ``run_sync`` bloquea el programa Python hasta que
la promesa de JavaScript se resuelve, sin congelar la página. Así los programas escritos para
la biblioteca Python (``hub.motor("A").run(100)``, ``yield task.sleep(1)``) funcionan sin cambios.

El botón «Detener» del editor activa una bandera: la siguiente llamada del programa al hub o
a ``sleep`` lanza ``KeyboardInterrupt`` (igual que Ctrl+C en la biblioteca original).
"""
import js
from pyodide.ffi import JsException, run_sync

from . import exceptions as _exc

_NAMES = ("WedoError", "BLEError", "HubConnectionError", "HubDisconnectedError", "OperationTimeout",
          "HubBusyError", "DeviceNotFoundError", "DeviceTypeError", "AmbiguousDeviceError",
          "InvalidStateError", "UnsupportedFeatureError")
_JS_ERRORS = {name: getattr(_exc, name) for name in _NAMES}


def _bridge():
    return js.wedopyBridge


def check_stop():
    if _bridge().stopRequested():
        raise KeyboardInterrupt("programa detenido desde el editor")


def convert(exc):
    """JsException -> excepción Python equivalente (misma jerarquía que la biblioteca)."""
    err = exc.js_error
    name, message = str(err.name), str(err.message)
    cls = _JS_ERRORS.get(name)
    if cls is not None:
        return cls(message)
    if name == "TypeError":
        return TypeError(message)
    if name == "RangeError":
        return ValueError(message)
    return exc


def call(fn, *args):
    """Llamada JavaScript síncrona (puede lanzar)."""
    check_stop()
    try:
        return fn(*args)
    except JsException as exc:
        raise convert(exc) from None


def get(obj, name):
    check_stop()
    try:
        return getattr(obj, name)
    except JsException as exc:
        raise convert(exc) from None


def wait(awaitable):
    """Bloquea hasta que una promesa de JavaScript se resuelva; devuelve su valor."""
    check_stop()
    try:
        result = run_sync(awaitable)
    except JsException as exc:
        raise convert(exc) from None
    check_stop()
    return result


def sleep(seconds):
    """Sustituto cooperativo de ``time.sleep``: cede el control a la página y admite «Detener»."""
    if isinstance(seconds, bool) or not isinstance(seconds, (int, float)):
        raise TypeError("seconds must be a number, not %s" % type(seconds).__name__)
    if seconds != seconds or seconds < 0:
        raise ValueError("sleep length must be a non-negative number")
    wait(_bridge().sleep(float(seconds)))


def hub():
    h = _bridge().getHub()
    if h is None:
        raise _exc.HubConnectionError(
            "No hay hub: conéctalo desde el panel «Conexión» (o elige el Simulador) antes de ejecutar.")
    return h
