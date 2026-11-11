"""Excepciones públicas de la API Wedo.

- ``WedoError``: base de todos los errores de la API.
- ``NotConnectedError``: se usa un recurso con el hub desconectado, o se pierde la
  conexión durante una espera.
- ``ConnectionFailedError``: el intento de conexión falló o fue rechazado.
- ``PortError``: el puerto está vacío o tiene un periférico de otro tipo.
- ``NoReadingError``: todavía no hay una lectura válida del dispositivo.
- ``KeyboardUnavailableError``: el entorno no puede entregar eventos de teclado.

``TaskCancelled`` deriva de ``BaseException`` (no de ``WedoError``): un ``except
Exception`` no debe capturar por accidente la cancelación de una tarea.
"""

__all__ = [
    "WedoError",
    "NotConnectedError",
    "ConnectionFailedError",
    "PortError",
    "NoReadingError",
    "KeyboardUnavailableError",
    "TaskCancelled",
]


class WedoError(Exception):
    """Base de los errores de la API Wedo."""


class NotConnectedError(WedoError):
    """El hub no está conectado (o se perdió la conexión durante una espera)."""


class ConnectionFailedError(WedoError):
    """El intento de conexión falló o fue rechazado."""


class PortError(WedoError):
    """El puerto está vacío o tiene un periférico de otro tipo."""


class NoReadingError(WedoError):
    """Todavía no hay una lectura válida del dispositivo."""


class KeyboardUnavailableError(WedoError):
    """El entorno no puede entregar eventos de pulsación y liberación de teclas."""


class TaskCancelled(BaseException):
    """La tarea fue cancelada.

    Deriva de ``BaseException`` a propósito: un ``except Exception`` no debe capturarla
    por accidente. Si se captura, hay que volver a lanzarla.
    """
