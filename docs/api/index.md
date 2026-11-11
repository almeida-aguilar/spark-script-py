---
layout: default
title: Resumen de la API
description: Índice general y estructura de la API de los programas Python del editor (v0.3.0)
prev:
  title: Hardware WeDo 2.0
  url: /hardware.html
next:
  title: Hub
  url: /api/hub.html
---

# Resumen de la API

La API que escriben los programas Python del editor (v0.3.0) está diseñada bajo principios de consistencia, claridad didáctica y seguridad. Todo el programa se organiza alrededor de una instancia de `Hub`, de la que cuelgan todos los recursos del hub; el teclado y las tareas son del módulo (`wedopy.key`, `wedopy.task`), no del hub:

```python
from wedopy import Hub
```

Las excepciones públicas se importan del módulo `wedopy`:

```python
from wedopy import WedoError, NotConnectedError, PortError
```

---

## 📑 Recursos y miembros

| Recurso | Acceso | Miembros | Documentación |
| :--- | :--- | :--- | :--- |
| **`Hub`** | `Hub(connect_timeout=10.0)` | `connect()`, `disconnect()`, `wait_connection(timeout=None)`, `ports()`, `with Hub() as hub` | [Ver API de Hub](hub.md) |
| **Motor** | `hub.motor("A")` | `run(value)`, `stop()` | [Ver API de Motores](motores.md) |
| **Distancia** | `hub.distance("A")` | `read()`, `has_change(filter=None)`, `wait_change(filter=None)` | [Ver API de Sensores](sensores.md) |
| **Inclinación** | `hub.tilt("A")` | `read()`, `has_change(filter=None)`, `wait_change(filter=None)` | [Ver API de Sensores](sensores.md) |
| **Eje X / Y** | `tilt.x` / `tilt.y` | `read()`, `has_change(filter=None)`, `wait_change(filter=None)` | [Ver API de Sensores](sensores.md) |
| **Botón** | `hub.button` | `read()`, `has_change(filter=None)`, `wait_change(filter=None)` | [Ver Periféricos](perifericos.md) |
| **Tecla** | `wedopy.key("space")` | `read()`, `has_change(filter=None)`, `wait_change(filter=None)` | [Ver Teclado](teclado.md) |
| **LED** | `hub.led` | `color(name)` o `color(r, g, b)` | [Ver Periféricos](perifericos.md) |
| **Tareas** | `wedopy.task` | `spawn(fn)`, `wait(seconds)` | [Ver Tareas Cooperativas](tareas.md) |
| **Tarea** | devuelta por `spawn(fn)` | `cancel()`, `join()` | [Ver Tareas Cooperativas](tareas.md) |

Excepciones: `WedoError`, `NotConnectedError`, `ConnectionFailedError`, `PortError`, `NoReadingError`, `KeyboardUnavailableError` y `TaskCancelled`. Detalles en [Excepciones](excepciones.md).

---

## 💡 Patrón de uso fundamental

```python
import wedopy
from wedopy import Hub

# La conexión se espera al entrar (10 segundos por defecto).
with Hub() as hub:
    motor = hub.motor("a")        # o "A": no se distinguen mayúsculas
    distancia = hub.distance("b")

    hub.led.color("light_green")
    motor.run(80)

    while distancia.read() > 3:   # escala 0..10
        wedopy.task.wait(0.05)

    motor.stop()
```

No hay grupos de motores ni autodetección: cada recurso se selecciona por puerto de forma explícita, así queda claro qué periférico recibe cada orden.
