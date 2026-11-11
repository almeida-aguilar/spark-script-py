"""Run motor A for two seconds."""
import time

import wedo
from wedo import Hub

with Hub() as hub:
    motor = hub.motor("A")
    motor.run(100)
    wedo.task.wait(2)
    motor.stop()
