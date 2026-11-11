"""Print the tilt direction and both axes."""
import time

import wedopy
from wedopy import Hub

with Hub() as hub:
    tilt = hub.tilt("A")
    for _ in range(20):
        print("direction", tilt.read(), "| x", tilt.x.read(), "| y", tilt.y.read())
        wedopy.task.wait(0.25)
