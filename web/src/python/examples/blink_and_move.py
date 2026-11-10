"""Blink the LED while a motor runs, using cooperative tasks (no threads, no asyncio)."""
from wedo import Hub

with Hub() as hub:
    motor = hub.motor("A")

    def blink():
        for _ in range(10):
            hub.led.color("yellow")
            hub.task.wait(0.3)
            hub.led.color("white")
            hub.task.wait(0.3)

    def move():
        try:                      # cancelling a task never stops the motor by itself
            motor.run(75)
            hub.task.wait(3)
        finally:
            motor.stop()

    hub.task.spawn(blink)
    hub.task.spawn(move)
    # Al salir del bloque se espera a que terminen las tareas.
