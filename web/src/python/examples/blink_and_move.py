"""Blink the LED while a motor runs, using cooperative tasks (no threads, no asyncio)."""
import wedo
from wedo import Hub

with Hub() as hub:
    motor = hub.motor("A")

    def blink():
        for _ in range(10):
            hub.led.color("yellow")
            wedo.task.wait(0.3)
            hub.led.color("white")
            wedo.task.wait(0.3)

    def move():
        try:                      # cancelling a task never stops the motor by itself
            motor.run(75)
            wedo.task.wait(3)
        finally:
            motor.stop()

    wedo.task.spawn(blink)
    wedo.task.spawn(move)
    # Al salir del bloque se espera a que terminen las tareas.
