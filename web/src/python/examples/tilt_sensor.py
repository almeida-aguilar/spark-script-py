"""Print the tilt direction and both axes."""
import time

from wedo import Hub

with Hub() as hub:
    tilt = hub.tilt("A")
    for _ in range(20):
        print("direction", tilt.read(), "| x", tilt.x.read(), "| y", tilt.y.read())
        hub.task.wait(0.25)
