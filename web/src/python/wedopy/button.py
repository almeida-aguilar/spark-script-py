"""Built-in button (same API as wedopy.button)."""
from . import _bridge


class Button:
    def __init__(self, js_button):
        self._js = js_button

    @property
    def is_pressed(self):
        return bool(_bridge.get(self._js, "isPressed"))

    @property
    def is_released(self):
        return not self.is_pressed
