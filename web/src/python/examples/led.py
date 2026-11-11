"""Cycle through the predefined LED colours, then show an RGB colour."""
import wedo
from wedo import Hub

COLOURS = ["pink", "purple", "blue", "light_blue", "light_green", "dark_green",
           "yellow", "orange", "red", "white"]

with Hub() as hub:
    for colour in COLOURS:
        hub.led.color(colour)
        wedo.task.wait(0.3)
    hub.led.color(255, 80, 0)
    wedo.task.wait(1)
