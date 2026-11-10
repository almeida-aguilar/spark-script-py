"""Drive until the distance sensor reports something nearer than 3 (scale 0..10)."""
from wedo import Hub

with Hub() as hub:
    sensor = hub.distance("B")
    motor = hub.motor("A")

    def drive():
        try:
            motor.run(70)
            while sensor.read() > 3:
                hub.task.wait(0.05)
        finally:
            motor.stop()

    hub.task.spawn(drive)
    drive.join()
    hub.led.color("light_green")
