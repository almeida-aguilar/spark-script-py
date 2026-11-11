"""Run motor A for two seconds."""
import time

import wedopy
from wedopy import Hub

with Hub() as hub:
    motor = hub.motor("A")
    motor.run(100)
    wedopy.task.wait(2)
    motor.stop()
