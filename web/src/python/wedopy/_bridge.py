"""Synchronous bridge between the wedopy Python API and the wedopy Web JavaScript API.

Works with Pyodide + JSPI (Chrome >= 137): ``run_sync`` blocks the Python program until the
JavaScript promise settles, without freezing the page. So programs written for the Python
library (``hub.motor("A").run(100)``, ``yield task.sleep(1)``) work unchanged.

The editor's Stop button raises a flag: the next call to the hub or to ``sleep`` raises
``KeyboardInterrupt`` (just like Ctrl+C in the original library).
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
    """JsException -> equivalent Python exception (same hierarchy as the library)."""
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
    """Synchronous JavaScript call (may raise)."""
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
    """Blocks until a JavaScript promise settles; returns its value.

    Stop rejects nothing: if the promise woke up early because the user pressed Stop, the
    flag is still raised and check_stop() turns it into a KeyboardInterrupt here, in plain
    Python (without crossing the JSPI boundary: raising exceptions through run_sync leaves
    orphaned continuations in Pyodide).
    """
    check_stop()
    try:
        result = run_sync(awaitable)
    except JsException as exc:
        raise convert(exc) from None
    check_stop()
    return result


def sleep(seconds):
    """Cooperative replacement for ``time.sleep``: yields control to the page and supports Stop."""
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
