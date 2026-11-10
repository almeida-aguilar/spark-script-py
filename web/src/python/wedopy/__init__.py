"""wedopy: control the LEGO WeDo 2.0 Smart Hub from Python.

    from wedopy import Hub

    with Hub() as hub:
        motor = hub.motor("A")
        motor.run(100)
"""
from . import task
from .button import Button
from .exceptions import (
    AmbiguousDeviceError,
    BLEError,
    DeviceNotFoundError,
    DeviceTypeError,
    HubBusyError,
    HubConnectionError,
    HubDisconnectedError,
    InvalidStateError,
    OperationTimeout,
    UnsupportedFeatureError,
    WedoError,
)
from .hub import Hub
from .led import (
    LED,
    OFF, BLACK, PINK, ROSE, PURPLE, VIOLET, BLUE, CYAN, LIGHT_BLUE, SKY_BLUE,
    LIGHT_GREEN, TEAL, GREEN, DARK_GREEN, YELLOW, ORANGE, RED, WHITE, BRIGHT_WHITE,
)
from .motor import Motor, MotorGroup
from .sensors import DistanceSensor, TiltSensor
from .time import running_time

__version__ = "0.1.2"

__all__ = [
    "Hub", "Motor", "MotorGroup", "DistanceSensor", "TiltSensor", "LED", "Button",
    "task", "running_time",
    "OFF", "BLACK", "PINK", "ROSE", "PURPLE", "VIOLET", "BLUE", "CYAN", "LIGHT_BLUE", "SKY_BLUE",
    "LIGHT_GREEN", "TEAL", "GREEN", "DARK_GREEN", "YELLOW", "ORANGE", "RED", "WHITE", "BRIGHT_WHITE",
    "WedoError", "BLEError", "HubConnectionError", "HubDisconnectedError", "OperationTimeout",
    "HubBusyError", "DeviceNotFoundError", "DeviceTypeError", "AmbiguousDeviceError",
    "InvalidStateError", "UnsupportedFeatureError",
]
