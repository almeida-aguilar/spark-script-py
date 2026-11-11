"""Botón integrado del hub (API v0.3.0): ``hub.button``.

    hub.button.read()                    -> bool
    hub.button.has_change("pressed")     -> bool (consume los cambios pendientes)
    hub.button.wait_change("released")   -> str  (tipo consumido)

Los cambios pendientes se conservan por tipo: una pulsación breve entre dos consultas no
se pierde; quedan pendientes "pressed" y "released".
"""
from . import _bridge


class Button:
    """Botón del hub: está integrado, no se selecciona por puerto."""

    def __init__(self, js_button) -> None:
        self._js = js_button

    def read(self) -> bool:
        """True si el botón está presionado."""
        return bool(_bridge.call(self._js.read))

    def has_change(self, filter: str | None = None) -> bool:
        """True si hay cambios pendientes (y los consume)."""
        return bool(_bridge.call(self._js.hasChange, filter))

    def wait_change(self, filter: str | None = None) -> str:
        """Espera un cambio y devuelve su tipo ("pressed" / "released")."""
        return str(_bridge.wait(self._js.waitChange(filter)))

    def __repr__(self) -> str:
        return "Button()"
