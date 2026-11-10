"""Run motor A for two seconds."""
import time

from wedo import Hub

with Hub() as hub:
    motor = hub.motor("A")
    motor.run(100)
    hub.task.wait(2)
    motor.stop()
