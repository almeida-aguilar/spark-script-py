"""Cycle through the predefined LED colours, then show an RGB colour."""
import wedopy
from wedopy import Hub

COLOURS = ["pink", "purple", "blue", "light_blue", "light_green", "dark_green",
           "yellow", "orange", "red", "white"]

with Hub() as hub:
    for colour in COLOURS:
        hub.led.color(colour)
        wedopy.task.wait(0.3)
    hub.led.color(255, 80, 0)
    wedopy.task.wait(1)
