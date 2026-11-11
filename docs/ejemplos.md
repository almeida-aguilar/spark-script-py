---
layout: default
title: Ejemplos Prácticos
description: Scripts y ejemplos listos para ejecutar en el editor Python de la aplicación web
prev:
  title: Arquitectura y Seguridad
  url: /arquitectura.html
next:
  title: Solución de Problemas
  url: /solucion-problemas.html
---

# Ejemplos Prácticos

Esta sección contiene programas completos probados en hardware real, listos para copiar, ejecutar y adaptar a tus propios modelos de LEGO WeDo 2.0.

Los archivos fuente de estos ejemplos están disponibles en el editor Python de la [app web de wedopy]({{ site.web_app_url }}) y en la carpeta del repositorio.

---

## 1. Concurrencia con Tareas: Luces y Movimiento

`blink_and_move.py` demuestra cómo hacer parpadear el LED mientras un motor gira durante 3 segundos, con dos tareas cooperativas que se alternan sin bloquear el programa.

```python
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
        try:                      # cancelar una tarea nunca detiene el motor por sí sola
            motor.run(75)
            wedopy.task.wait(3)
        finally:
            motor.stop()

    wedopy.task.spawn(blink)
    wedopy.task.spawn(move)
    # Al salir del bloque se espera a que terminen las tareas.
```

---

## 2. Vehículo Evasor de Obstáculos

`distance_sensor.py` acciona el motor al 70% de potencia y supervisa el sensor de proximidad en tiempo real. Cuando un obstáculo se encuentra a menos de nivel 3 (muy cerca), el vehículo frena inmediatamente.

```python
"""Drive until the distance sensor reports something nearer than 3 (scale 0..10)."""
import wedopy
from wedopy import Hub

with Hub() as hub:
    sensor = hub.distance("B")
    motor = hub.motor("A")

    def drive():
        try:
            motor.run(70)
            while sensor.read() > 3:
                wedopy.task.wait(0.05)
        finally:
            motor.stop()

    drive_task = wedopy.task.spawn(drive)
    drive_task.join()
    hub.led.color("light_green")
```

---

## 3. Robot de Dos Motores

`two_motors.py` controla simultáneamente dos motores conectados a los puertos A y B (por ejemplo, las dos ruedas motrices de un vehículo). No hay grupo de motores: se hacen dos llamadas explícitas, así queda claro qué periférico recibe cada orden.

```python
"""Drive two motors together (two explicit calls, one per motor), then stop."""
import wedopy
from wedopy import Hub

with Hub() as hub:
    a = hub.motor("A")
    b = hub.motor("B")

    a.run(75)
    b.run(75)
    wedopy.task.wait(2)

    a.stop()
    b.stop()
```

---

## 4. Monitor de Orientación con Sensor de Inclinación

`tilt_sensor.py` toma 20 muestras periódicas reportando la dirección física (`left`, `right`, `forward`, `backward`, `none`) y los dos ejes en grados.

```python
"""Print the tilt direction and both axes."""
import wedopy
from wedopy import Hub

with Hub() as hub:
    tilt = hub.tilt("A")

    for _ in range(20):
        print("direction", tilt.read(), "| x", tilt.x.read(), "| y", tilt.y.read())
        wedopy.task.wait(0.25)
```

---

## 5. Espectro y Ciclo de Colores LED

`led.py` recorre uno a uno los once colores predefinidos de la paleta del dispositivo y finaliza encendiendo un color RGB personalizado.

```python
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
```

---

## 6. Avanzar hasta pulsar el botón, con límite de tiempo

Combinación de botón, motor y una tarea vigilante que impone un plazo sin necesidad de parámetros de *timeout*:

```python
import wedopy
from wedopy import Hub

with Hub() as hub:
    motor = hub.motor("A")
    button = hub.button

    def drive():
        try:
            motor.run(50)
            button.wait_change("pressed")
        finally:
            motor.stop()

    def limit():
        wedopy.task.wait(5)
        drive_task.cancel()

    drive_task = wedopy.task.spawn(drive)
    limit_task = wedopy.task.spawn(limit)

    drive_task.join()
    limit_task.cancel()
    hub.led.color("light_green")
```
