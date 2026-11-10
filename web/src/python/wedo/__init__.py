"""wedo: control del LEGO WeDo 2.0 Smart Hub desde Python.

    from wedo import Hub

    with Hub() as hub:
        hub.led.color("green")
        hub.motor("A").run(50)
        hub.task.wait(2)
        hub.motor("A").stop()

La API es síncrona en apariencia: la cooperación se expresa con las esperas de
``hub.task`` y las de los recursos (``wait_change``), no con corrutinas.
"""
from .button import Button
from .exceptions import (
    ConnectionFailedError,
    NoReadingError,
    NotConnectedError,
    PortError,
    TaskCancelled,
    WedoError,
)
from .hub import Hub
from .led import LED
from .motor import Motor
from .sensors import DistanceSensor, TiltAxis, TiltSensor
from .task import Task, TaskNamespace

__version__ = "0.2.0"

__all__ = [
    "Hub",
    "Motor",
    "DistanceSensor",
    "TiltSensor",
    "TiltAxis",
    "Button",
    "LED",
    "Task",
    "WedoError",
    "NotConnectedError",
    "ConnectionFailedError",
    "PortError",
    "NoReadingError",
    "TaskCancelled",
    "__version__",
]
