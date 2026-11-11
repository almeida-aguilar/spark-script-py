"""Motores (API v0.3.0).

    motor = hub.motor("A")
    motor.run(50)      # -100..100: el signo es el sentido, el valor absoluto la intensidad
    motor.stop()        # alias de run(0)

No hay grupo de motores: para actuar sobre los dos se hacen dos llamadas explícitas.
"""
from . import _bridge


def _number(name, value):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise TypeError("%s must be a number, not %s" % (name, type(value).__name__))
    return value


class Motor:
    """Un motor en el puerto indicado."""

    def __init__(self, js_motor, port: str) -> None:
        self._js = js_motor
        self.port = port

    def run(self, value: float) -> None:
        """Fija la velocidad lógica, de -100 a 100."""
        _bridge.wait(_bridge.call(self._js.run, _number("value", value)))

    def stop(self) -> None:
        """Pide parar el motor (alias de ``run(0)``)."""
        _bridge.wait(self._js.stop())

    def __repr__(self) -> str:
        return "Motor(%r)" % self.port
