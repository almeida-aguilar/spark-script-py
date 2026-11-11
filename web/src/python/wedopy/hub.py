"""El hub Wedo (LEGO WeDo 2.0 Smart Hub) (API v0.3.0).

    from wedopy import Hub

    import wedopy
    with Hub() as hub:
        hub.motor("A").run(50)
        wedopy.task.wait(2)
        hub.motor("A").stop()

Crear un ``Hub`` no conecta: hay que llamar a ``connect()`` (que solo inicia el intento) y
esperar con ``wait_connection()``, o usar el bloque ``with``, que hace ambas cosas y además
espera a las tareas y para los motores al salir.

Las diferencias con la biblioteca de escritorio (que usa Bluetooth en el sistema) son:

* La conexión la inicia el panel del navegador: el selector de Bluetooth necesita un clic
  del usuario, así que ``connect()`` no puede abrirlo desde el programa.
* ``Hub()`` usa el hub ya conectado en el panel (real o simulado).
* El botón «Detener» del editor equivale a Ctrl+C: interrumpe el programa.
"""
from . import _bridge
from .button import Button
from .exceptions import ConnectionFailedError
from .led import LED
from .motor import Motor
from .sensors import DistanceSensor, TiltSensor
from .task import task as _task


def _timeout(name, value):
    if value is None:
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise TypeError("%s must be a number, not %s" % (name, type(value).__name__))
    if value != value or value in (float("inf"), float("-inf")) or value < 0:
        raise ValueError("%s must be a finite number >= 0, got %r" % (name, value))
    return float(value)


def _port(port):
    if not isinstance(port, str):
        raise TypeError("port must be 'A' or 'B', not %s" % type(port).__name__)
    if port.upper() not in ("A", "B"):
        raise ValueError("port must be 'A' or 'B', got %r" % port)
    return port


class Hub:
    """El dispositivo Wedo.

    ``connect_timeout`` es el tiempo máximo, en segundos, que ``with Hub() as hub`` espera
    a que se complete la conexión (``None`` espera indefinidamente).
    """

    def __init__(self, *, connect_timeout: float | None = 10.0) -> None:
        self._js = _bridge.hub()
        self._connect_timeout = _timeout("connect_timeout", connect_timeout)
        self._led = LED(self._js.led)
        self._button = Button(self._js.button)

    # -- ciclo de vida ------------------------------------------------------------------

    def connect(self) -> None:
        """Inicia el intento de conexión y regresa de inmediato."""
        _bridge.call(self._js.connect)

    def wait_connection(self, timeout: float | None = None) -> bool:
        """Espera a que el hub esté conectado.

        Devuelve ``True`` si se conectó y ``False`` si se agotó el tiempo. Si el intento
        falló, lanza ``ConnectionFailedError``.
        """
        limit = _timeout("timeout", timeout)
        return bool(_bridge.wait(_bridge.call(self._js.waitConnection, limit)))

    def disconnect(self) -> None:
        """Cierra la conexión (parando antes los motores)."""
        _bridge.wait(self._js.disconnect())

    def ports(self) -> dict[str, str]:
        """Instantánea de los puertos: ``{"a": "motor", "b": "distance"}``.

        Los nombres van en minúsculas. El botón y el LED están integrados y no aparecen.
        """
        return _bridge.call(self._js.ports).to_py()

    # -- periféricos --------------------------------------------------------------------

    def motor(self, port: str) -> Motor:
        """Un motor en el puerto indicado. No exige conexión."""
        return Motor(_bridge.call(self._js.motor, _port(port)), _port(port).lower())

    def distance(self, port: str) -> DistanceSensor:
        """Un sensor de distancia en el puerto indicado. No exige conexión."""
        return DistanceSensor(_bridge.call(self._js.distance, _port(port)), _port(port).lower())

    def tilt(self, port: str) -> TiltSensor:
        """Un sensor de inclinación en el puerto indicado. No exige conexión."""
        return TiltSensor(_bridge.call(self._js.tilt, _port(port)), _port(port).lower())

    @property
    def led(self) -> LED:
        """El LED integrado del hub."""
        return self._led

    @property
    def button(self) -> Button:
        """El botón integrado del hub."""
        return self._button

    # -- gestor de contexto ---------------------------------------------------------------

    def __enter__(self) -> "Hub":
        self.connect()
        if not self.wait_connection(self._connect_timeout):
            try:
                self.disconnect()
            except Exception:
                pass
            detail = ""
            if self._connect_timeout is not None:
                detail = " (tiempo de espera agotado: %g s)" % self._connect_timeout
            raise ConnectionFailedError("no se pudo conectar con el hub" + detail)
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        # Al salir: esperar a las tareas (o cancelarlas si hubo excepción) y parar los
        # motores. Nunca se suprime la excepción que provocó la salida.
        # La conexión NO se cierra aquí: en el navegador el enlace del hub es del panel
        # de la aplicación, no del programa (el botón «Desconectar» es quien lo cierra).
        try:
            # Las tareas son del programa y no del hub (v5 §12): el bloque las espera
            # (o las cancela, en la salida por excepción) igualmente.
            if exc_type is None:
                _task._all_settled()
            else:
                _task._cancel_all()
                try:
                    _task._all_settled()
                except Exception:
                    pass
        finally:
            try:
                _bridge.wait(self._js.stopAll())
            except Exception:
                pass

    def __repr__(self) -> str:
        return "Hub()"
