"""Blink the LED while a motor runs, using cooperative tasks (no threads, no asyncio)."""
import wedopy
from wedopy import Hub

with Hub() as hub:
    motor = hub.motor("A")

    def blink():
        for _ in range(10):
            hub.led.color("yellow")
            wedopy.task.wait(0.3)
            hub.led.color("white")
            wedopy.task.wait(0.3)

    def move():
        try:                      # cancelling a task never stops the motor by itself
            motor.run(75)
            wedopy.task.wait(3)
        finally:
            motor.stop()

    wedopy.task.spawn(blink)
    wedopy.task.spawn(move)
    # Al salir del bloque se espera a que terminen las tareas.
