"""LED integrado del hub (API v0.3.0): ``hub.led``.

    hub.led.color("green")     # color predefinido por nombre
    hub.led.color(255, 0, 0)   # color absoluto (canales 0..255)

El catálogo de colores predefinidos es el del firmware real (comprobado en hardware): el
índice 5 es el verde claro y el 6 el verde puro, así que a partir del 5 todo va desplazado
uno respecto a la tabla que circulaba por la documentación de LEGO.
"""
from . import _bridge


def _channel(name, value):
    if isinstance(value, bool) or not isinstance(value, int):
        raise TypeError("%s must be an integer, not %s" % (name, type(value).__name__))
    if not 0 <= value <= 255:
        raise ValueError("%s must be in 0..255, got %r" % (name, value))
    return value


class LED:
    """LED multicolor del hub: está integrado, no se selecciona por puerto."""

    def __init__(self, js_led) -> None:
        self._js = js_led

    def color(self, name_or_red, green=None, blue=None) -> None:
        """Color predefinido por nombre o color absoluto (r, g, b)."""
        if green is None and blue is None:
            if not isinstance(name_or_red, str):
                raise TypeError(
                    "color() needs a colour name or three RGB channels, not %s"
                    % type(name_or_red).__name__
                )
            _bridge.wait(self._js.color(name_or_red))
            return
        if green is None or blue is None:
            raise TypeError("color() takes either a colour name or three RGB channels")
        _bridge.wait(self._js.color(
            _channel("red", name_or_red),
            _channel("green", green),
            _channel("blue", blue),
        ))

    def __repr__(self) -> str:
        return "LED()"
