"""Sensores de distancia e inclinación (API v0.3.0).

    distance = hub.distance("A")
    distance.read()                      # cm enteros 0..10
    distance.has_change("increase")      # consume los cambios pendientes
    distance.wait_change("decrease")     # espera un cambio y devuelve su tipo

    tilt = hub.tilt("B")
    tilt.read()                          # "left" | "right" | "forward" | "backward" | "none"
    tilt.x.read()                        # grados enteros -45..45
    tilt.x.has_change("increase")

El sensor de inclinación es un interruptor de 4 posiciones, no un acelerómetro: el
firmware solo notifica cuando el valor cambia.
"""
from . import _bridge


class DistanceSensor:
    """Sensor de distancia: valores enteros normalizados 0..10."""

    def __init__(self, js_sensor, port: str) -> None:
        self._js = js_sensor
        self.port = port

    def read(self) -> int:
        """Distancia en centímetros (0..10)."""
        return int(_bridge.wait(self._js.read()))

    def has_change(self, filter: str | None = None) -> bool:
        """True si hay cambios pendientes (y los consume)."""
        return bool(_bridge.call(self._js.hasChange, filter))

    def wait_change(self, filter: str | None = None) -> str:
        """Espera un cambio y devuelve su tipo ("increase" / "decrease")."""
        return str(_bridge.wait(self._js.waitChange(filter)))

    def __repr__(self) -> str:
        return "DistanceSensor(%r)" % self.port


class TiltAxis:
    """Un eje del sensor de inclinación (recurso independiente)."""

    def __init__(self, js_axis, port: str, name: str) -> None:
        self._js = js_axis
        self.port = port
        self.name = name

    def read(self) -> int:
        """Ángulo del eje en grados (-45..45)."""
        return int(_bridge.wait(self._js.read()))

    def has_change(self, filter: str | None = None) -> bool:
        """True si hay cambios pendientes (y los consume)."""
        return bool(_bridge.call(self._js.hasChange, filter))

    def wait_change(self, filter: str | None = None) -> str:
        """Espera un cambio y devuelve su tipo ("increase" / "decrease")."""
        return str(_bridge.wait(self._js.waitChange(filter)))

    def __repr__(self) -> str:
        return "TiltAxis(%r, %r)" % (self.port, self.name)


class TiltSensor:
    """Sensor de inclinación: dirección y ejes."""

    def __init__(self, js_sensor, port: str) -> None:
        self._js = js_sensor
        self.port = port
        self._x = TiltAxis(js_sensor.x, port, "x")
        self._y = TiltAxis(js_sensor.y, port, "y")

    def read(self) -> str:
        """Dirección actual: "left", "right", "forward", "backward" o "none"."""
        return str(_bridge.wait(self._js.read()))

    def has_change(self, filter: str | None = None) -> bool:
        """True si hay cambios de dirección pendientes (y los consume)."""
        return bool(_bridge.call(self._js.hasChange, filter))

    def wait_change(self, filter: str | None = None) -> str:
        """Espera un cambio de dirección y devuelve su tipo."""
        return str(_bridge.wait(self._js.waitChange(filter)))

    @property
    def x(self) -> TiltAxis:
        """Eje X del sensor."""
        return self._x

    @property
    def y(self) -> TiltAxis:
        """Eje Y del sensor."""
        return self._y

    def __repr__(self) -> str:
        return "TiltSensor(%r)" % self.port
