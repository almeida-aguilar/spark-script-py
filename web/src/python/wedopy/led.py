"""Built-in LED (same API and constants as wedopy.led; calls the JavaScript API)."""
from . import _bridge

# Colour index constants (discrete mode 0..10).
# Indexed colours of the Smart Hub LED, as the firmware really maps them (checked on
# hardware): 0 off, 1 pink, 2 purple, 3 blue, 4 cyan/light blue, 5 light green, 6 green,
# 7 yellow, 8 orange, 9 red, 10 white.
# Note that index 5 is the light green and 6 the pure green, so from 5 on everything is
# shifted by one compared with the table in LEGO's documentation (which omits the light
# green and adds a grey the firmware does not have).
OFF = 0
BLACK = 0
PINK = 1
ROSE = 1
PURPLE = 2
VIOLET = 2
BLUE = 3
CYAN = 4
LIGHT_BLUE = 4
SKY_BLUE = 4
LIGHT_GREEN = 5
TEAL = 5
GREEN = 6
DARK_GREEN = 6
YELLOW = 7
ORANGE = 8
RED = 9
WHITE = 10
BRIGHT_WHITE = 10

__all__ = [
    "LED",
    "OFF",
    "BLACK",
    "PINK",
    "ROSE",
    "PURPLE",
    "VIOLET",
    "BLUE",
    "CYAN",
    "LIGHT_BLUE",
    "SKY_BLUE",
    "LIGHT_GREEN",
    "TEAL",
    "GREEN",
    "DARK_GREEN",
    "YELLOW",
    "ORANGE",
    "RED",
    "WHITE",
    "BRIGHT_WHITE",
]


def _byte(name, value, hi):
    if isinstance(value, bool) or not isinstance(value, int):
        raise TypeError("%s must be an int, not %s" % (name, type(value).__name__))
    if not 0 <= value <= hi:
        raise ValueError("%s must be in 0..%d, got %d" % (name, hi, value))
    return value


class LED:
    """Indexed colours (0..10) and RGB are different hub modes; the core tracks which is active."""

    OFF = OFF
    BLACK = BLACK
    PINK = PINK
    ROSE = ROSE
    PURPLE = PURPLE
    VIOLET = VIOLET
    BLUE = BLUE
    CYAN = CYAN
    LIGHT_BLUE = LIGHT_BLUE
    SKY_BLUE = SKY_BLUE
    LIGHT_GREEN = LIGHT_GREEN
    TEAL = TEAL
    GREEN = GREEN
    DARK_GREEN = DARK_GREEN
    YELLOW = YELLOW
    ORANGE = ORANGE
    RED = RED
    WHITE = WHITE
    BRIGHT_WHITE = BRIGHT_WHITE

    def __init__(self, js_led):
        self._js = js_led

    def on(self):
        """White."""
        self.rgb(255, 255, 255)

    def off(self):
        self.rgb(0, 0, 0)

    def index(self, index):
        _bridge.wait(self._js.index(_byte("index", index, 10)))

    def rgb(self, red, green, blue):
        _bridge.wait(self._js.rgb(_byte("red", red, 255), _byte("green", green, 255),
                                  _byte("blue", blue, 255)))
