"""wedopy: control del LEGO WeDo 2.0 Smart Hub desde Python.

    from wedopy import Hub

    import wedopy
    with Hub() as hub:
        hub.led.color("light_green")
        hub.motor("A").run(50)
        wedopy.task.wait(2)
        hub.motor("A").stop()

La API es síncrona en apariencia: la cooperación se expresa con las esperas de
``wedopy.task`` y las de los recursos (``wait_change``), no con corrutinas.
"""
from .button import Button
from .exceptions import (
    ConnectionFailedError,
    KeyboardUnavailableError,
    NoReadingError,
    NotConnectedError,
    PortError,
    TaskCancelled,
    WedoError,
)
from .hub import Hub
from .keyboard import Key, key
from .led import LED
from .motor import Motor
from .sensors import DistanceSensor, TiltAxis, TiltSensor
from .task import Task, task

__version__ = "0.3.0"

__all__ = [
    "Hub",
    "key",
    "task",
    "Motor",
    "DistanceSensor",
    "TiltSensor",
    "TiltAxis",
    "Button",
    "Key",
    "LED",
    "Task",
    "WedoError",
    "NotConnectedError",
    "ConnectionFailedError",
    "PortError",
    "NoReadingError",
    "KeyboardUnavailableError",
    "TaskCancelled",
    "__version__",
]
