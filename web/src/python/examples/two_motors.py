"""Drive two motors together (two explicit calls, one per motor), then stop."""
import time

from wedo import Hub

with Hub() as hub:
    a = hub.motor("A")
    b = hub.motor("B")
    a.run(75)
    b.run(75)
    hub.task.wait(2)
    a.stop()
    b.stop()
