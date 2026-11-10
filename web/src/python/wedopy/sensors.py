"""Sensores de distancia e inclinación (misma API que wedopy.sensors)."""
import math

from . import _bridge


class DistanceSensor:
    """Distance sensor. Values are normalised integers 0..10, not centimetres."""

    def __init__(self, js_sensor):
        self._js = js_sensor
        self.port = str(js_sensor.port)

    def read(self):
        return int(_bridge.wait(self._js.read()))

    @staticmethod
    def _threshold(threshold):
        if isinstance(threshold, bool) or not isinstance(threshold, (int, float)):
            raise TypeError("threshold must be a number")
        if not math.isfinite(threshold) or not 0 <= threshold <= 10:
            raise ValueError("threshold must be a finite number in 0..10")
        return threshold

    def is_near(self, threshold):
        """True when ``read() < threshold`` (strict)."""
        t = self._threshold(threshold)
        return self.read() < t

    def is_far(self, threshold):
        """True when ``read() > threshold`` (strict)."""
        t = self._threshold(threshold)
        return self.read() > t

    def __repr__(self):
        return "DistanceSensor(%r)" % self.port


class TiltSensor:
    """Tilt sensor (a 4-position switch, not an accelerometer). Reads only update on change."""

    def __init__(self, js_sensor):
        self._js = js_sensor
        self.port = str(js_sensor.port)

    def read_angle(self):
        """``(x, y)`` in degrees, nominally -45..45."""
        return tuple(_bridge.wait(self._js.readAngle()).to_py())

    def read_direction(self):
        """One of ``neutral``, ``back``, ``right``, ``left``, ``forward``."""
        return str(_bridge.wait(self._js.readDirection()))

    def __repr__(self):
        return "TiltSensor(%r)" % self.port
