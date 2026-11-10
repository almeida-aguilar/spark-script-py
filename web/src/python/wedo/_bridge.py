"""Puente síncrono entre la API Python de Wedo y la API JavaScript de la aplicación.

Funciona con Pyodide + JSPI (Chrome >= 137): ``run_sync`` bloquea el programa Python hasta que
la promesa de JavaScript se resuelve, sin congelar la página. Así, los programas escritos de
forma síncrona funcionan sin cambios.

El botón «Detener» del editor activa una bandera: la siguiente llamada del programa al hub o
a una espera lanza ``KeyboardInterrupt`` (igual que Ctrl+C).

Regla de oro para la cancelación (aprendido con trazas en Pyodide): JAMÁS se rechaza una
promesa cuyo resultado espera ``run_sync`` — eso deja continuaciones de pila huérfanas. Las
esperas se **resuelven** con un marcador ("ok" | "cancelled" | "stopped") y el código Python,
de vuelta, lanza la excepción en su propia pila (véase ``wedo.task``).
"""
import js
from pyodide.ffi import JsException, run_sync

from .exceptions import (
    ConnectionFailedError,
    NoReadingError,
    NotConnectedError,
    PortError,
    TaskCancelled,
    WedoError,
)

# Errores de JavaScript -> excepciones de la API.
_JS_ERRORS = {
    "WedoError": WedoError,
    "NotConnectedError": NotConnectedError,
    "ConnectionFailedError": ConnectionFailedError,
    "PortError": PortError,
    "NoReadingError": NoReadingError,
    "HubDisconnectedError": NotConnectedError,
    "InvalidStateError": NotConnectedError,
    "HubConnectionError": ConnectionFailedError,
    "DeviceNotFoundError": PortError,
    "DeviceTypeError": PortError,
    "AmbiguousDeviceError": WedoError,
    "UnsupportedFeatureError": WedoError,
    "OperationTimeout": WedoError,
    "TaskCancelled": TaskCancelled,
}


def _bridge():
    return js.wedoBridge


def hub():
    """El hub de JavaScript (el que está conectado en el panel)."""
    js_hub = _bridge().getHub()
    if js_hub is None or js_hub is js.undefined:
        raise NotConnectedError("no hay ningún hub conectado en el panel")
    return js_hub


def check_stop():
    """Un solo disparo, como Ctrl+C: la limpieza del programa (finally) puede llamar al hub."""
    if _bridge().stopRequested():
        raise KeyboardInterrupt("programa detenido desde el editor")


def convert(exc):
    """JsException -> excepción Python equivalente."""
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
    """Llamada JavaScript síncrona (una función o un método; puede lanzar)."""
    check_stop()
    try:
        return fn(*args)
    except JsException as exc:
        raise convert(exc) from None


def get(obj, name):
    """Propiedad de un objeto JavaScript."""
    check_stop()
    try:
        return getattr(obj, name)
    except JsException as exc:
        raise convert(exc) from None


def wait(awaitable):
    """Bloquea hasta que una promesa de JavaScript se resuelva; devuelve su valor.

    «Detener» no rechaza nada: si la promesa despertó antes de tiempo porque el usuario
    pulsó «Detener», la bandera sigue levantada y ``check_stop()`` la convierte aquí en
    KeyboardInterrupt, en puro Python (sin cruzar la frontera JSPI). Una cancelación de
    tarea (``TaskCancelled``) sí llega como JsException con nombre TaskCancelled.
    """
    check_stop()
    try:
        result = run_sync(awaitable)
    except JsException as exc:
        raise convert(exc) from None
    check_stop()
    return result


def sleep(seconds):
    """Suspenso del programa: cede a la página y admite «Detener».

    La promesa de JavaScript se despierta antes de tiempo al pulsar «Detener» (resolución
    normal, sin rechazar); ``check_stop()`` tras volver de ``run_sync`` lanza aquí el
    KeyboardInterrupt, en puro Python.
    """
    return wait(js.wedoBridge.sleep(seconds))
