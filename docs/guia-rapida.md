---
layout: default
title: Guía de Inicio Rápido
description: Primeros pasos y ejemplos prácticos para controlar WeDo 2.0 desde el navegador con la aplicación web
prev:
  title: Introducción
  url: /
next:
  title: Hardware WeDo 2.0
  url: /hardware.html
---

# Guía de Inicio Rápido

¡Bienvenido a **wedopy-web**! En pocos minutos tendrás tu primer programa comunicándose con el LEGO WeDo 2.0 Smart Hub, desde el navegador y sin instalar nada.

---

## 1. Encender el Smart Hub

1. Inserta dos pilas AA o la batería recargable en el Smart Hub.
2. Pulsa el botón físico central. El LED comenzará a parpadear en blanco suave, indicando que el dispositivo está anunciándose por BLE (*advertising*).
3. Asegúrate de que el Bluetooth de tu ordenador esté activo.

---

## 2. Conectar desde el panel y el bloque `with Hub()`

La conexión del hub la gestiona el **panel de la aplicación** (el selector de Bluetooth necesita un clic): pulsa «Conectar» y elige el hub. Los programas Python se escriben para esa conexión con un bloque `with Hub() as hub:`, que se encarga de:
- Esperar a que el hub del panel esté conectado (10 segundos por defecto; con `Hub(connect_timeout=30)` das más margen).
- Identificar los periféricos conectados en los puertos A y B y recibir la primera lectura de sus sensores.
- Al salir (por fin de programa o por excepción), esperar o cancelar las tareas pendientes y detener todos los motores. El programa NO cierra la conexión: la conexión es del panel, no del programa.

```python
from wedopy import Hub

with Hub() as hub:
    print("¡Conectado al Smart Hub!")
    print("Dispositivos detectados:", hub.ports())
```

Salida típica:
```text
¡Conectado al Smart Hub!
Dispositivos detectados: {'a': 'motor', 'b': 'tilt'}
```

Los nombres de puerto se escriben con `A` o `B`, aunque no se distinguen mayúsculas de minúsculas: `hub.motor("a")` y `hub.motor("A")` son equivalentes.

---

## 3. Controlar un Motor

Conecta un motor en el puerto **A** o **B** y selecciónalo por puerto de forma explícita:

```python
import wedopy
from wedopy import Hub

with Hub() as hub:
    motor = hub.motor("A")

    # Girar hacia adelante al 70 %
    print("Girando hacia adelante...")
    motor.run(70)
    wedopy.task.wait(2)

    # Invertir la dirección (-70 %)
    print("Invirtiendo marcha...")
    motor.run(-70)
    wedopy.task.wait(2)

    # Detener el motor
    motor.stop()
```

> [!IMPORTANT]
> Para esperar se usa `wedopy.task.wait()`, no `time.sleep()`: una espera bloqueante detendría también a las demás tareas y el procesamiento de eventos del dispositivo.

El valor de `run()` va de `-100` a `100`: el signo determina el sentido de giro y el valor absoluto la intensidad. Un valor con parte decimal se redondea al entero más cercano.

---

## 4. Cambiar el color del LED

El LED integrado se controla con `hub.led.color()`, por nombre o con canales RGB (0 a 255):

```python
import wedopy
from wedopy import Hub

with Hub() as hub:
    print("Color azul...")
    hub.led.color("blue")
    wedopy.task.wait(1)

    print("Color verde claro...")
    hub.led.color("light_green")
    wedopy.task.wait(1)

    # Color RGB personalizado (naranja brillante)
    print("Color RGB naranja...")
    hub.led.color(255, 100, 0)
    wedopy.task.wait(1)

    # Apagar el LED
    hub.led.color("off")
```

Los nombres válidos son once: `off`, `pink`, `purple`, `blue`, `light_blue`, `light_green`, `dark_green`, `yellow`, `orange`, `red` y `white`. Un nombre desconocido lanza `ValueError` listando los colores válidos (no hay alias, por ejemplo no existe `"green"`).

---

## 5. Leer el Sensor de Distancia

El sensor de distancia devuelve una escala entera de **0** (objeto muy cerca) a **10** (despejado):

```python
import wedopy
from wedopy import Hub

with Hub() as hub:
    sensor = hub.distance("B")

    print("Acerca tu mano al sensor de distancia...")
    for _ in range(10):
        dist = sensor.read()
        print(f"Distancia: {dist}")
        wedopy.task.wait(0.5)
```

También puedes reaccionar a cambios en lugar de sondear:

```python
import wedopy
from wedopy import Hub

with Hub() as hub:
    sensor = hub.distance("B")

    def cerca():
        sensor.wait_change("decrease")
        hub.led.color("red")
        hub.motor("A").stop()

    wedopy.task.spawn(cerca)
```

---

## 6. Leer el Sensor de Inclinación (Tilt)

El sensor de inclinación detecta cinco direcciones (`left`, `right`, `forward`, `backward`, `none`) y ofrece dos ejes en grados:

```python
import wedopy
from wedopy import Hub

with Hub() as hub:
    tilt = hub.tilt("A")

    print("Inclina el sensor en diferentes direcciones...")
    for _ in range(10):
        print(f"Dirección: {tilt.read():<8} | x: {tilt.x.read():+d} | y: {tilt.y.read():+d}")
        wedopy.task.wait(0.5)
```

> **Importante:** Por diseño del firmware WeDo 2.0, los sensores solo transmiten datos por BLE cuando detectan un cambio físico. Si el sensor está completamente inmóvil, no llegan nuevas muestras; el hub informa la primera lectura al conectar y después solo cambia cuando el valor cambia.

---

## 7. Leer el Botón del Hub

El botón físico central devuelve `True` mientras está presionado:

```python
from wedopy import Hub

with Hub() as hub:
    print("Pulsa el botón central del Smart Hub...")
    hub.button.wait_change("pressed")
    hub.led.color("red")
    hub.button.wait_change("released")
    hub.led.color("light_green")
```

---

## Siguiente paso

Ahora que conoces los componentes básicos, revisa la sección de [**Hardware WeDo 2.0**](hardware.md) para comprender en detalle los modos de los sensores y el comportamiento real del firmware.
