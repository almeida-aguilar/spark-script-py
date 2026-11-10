---
layout: default
title: Introducción a wedo
description: Paquete Python para el LEGO WeDo 2.0 Smart Hub sobre Bluetooth Low Energy (BLE)
next:
  title: Instalación
  url: /instalacion.html
---

# wedo

**`wedo`** es un paquete moderno en Python para controlar el **LEGO® WeDo 2.0 Smart Hub** a través de Bluetooth Low Energy (BLE). Diseñado para educación, robótica y prototipado, combina una API de alto nivel intuitiva en Python con un núcleo de ejecución de bajo nivel fiable.

```python
from wedo import Hub

with Hub() as hub:
    # Encender el LED en color azul
    hub.led.color("blue")

    # Girar el motor conectado al puerto A
    motor = hub.motor("A")
    motor.run(75)

    print("Dispositivos conectados:", hub.ports())
```

> **Esta misma API funciona en el navegador.** La [app web de wedopy]({{ site.web_app_url }})
> ejecuta estos programas con Python (Pyodide) sobre el hub real por Web Bluetooth o sobre el
> simulador integrado, sin instalar nada. Los ejemplos de esta documentación son válidos tal cual.

---

## 🚀 Características principales

- **API Pythonic y sencilla**: Diseñada para ser legible, accesible y didáctica, respetando las mejores prácticas de Python (`with Hub() as hub:`).
- **Selección explícita de puertos**: cada recurso se obtiene por puerto (`hub.motor("A")`, `hub.distance("B")`), sin autodetección implícita: queda claro qué periférico recibe cada orden.
- **Seguridad garantizada por el runtime**: al salir del bloque `with` o al desconectar, se detienen todos los motores. Además, un *watchdog* interno ejecuta una parada de emergencia si la comunicación se corta con motores en marcha.
- **Tareas cooperativas integradas**: concurrencia ligera educativa con `hub.task.spawn()` y `hub.task.wait()`, sin lidiar con bloqueos de hilos ni con la complejidad sintáctica de `asyncio`.
- **Validado en hardware real**: Probado y calibrado con el Smart Hub WeDo 2.0 real y sus sensores:
  - **Motores**: control de velocidad (-100 a +100), con parada `stop()` y redondeo del valor.
  - **Sensor de inclinación (Tilt)**: direcciones (`left`, `right`, `forward`, `backward`, `none`) y ejes `(x, y)` en grados.
  - **Sensor de distancia**: lectura normalizada (0 a 10) y cambios (`"increase"`, `"decrease"`).
  - **LED**: once colores predefinidos por nombre y color verdadero RGB 24-bit.
  - **Botón integrado**: lectura de estado y cambios (`"pressed"`, `"released"`).

---

## 🏛️ Estructura de dos niveles

La arquitectura separa estrictamente las responsabilidades:

| Componente | Lenguaje | Responsabilidad |
| :--- | :--- | :--- |
| **API Pública** (`wedo/`) | Python | `Hub`, motor, sensores, LED, botón, tareas, excepciones y gestores de contexto. |
| **Núcleo Interno** | JS/Cython | Codecs del protocolo WeDo 2.0, coordinador de cola única BLE, watchdog, máquina de estados y transportes (`Web Bluetooth`, `Bleak`, simulador). |

El usuario final simplemente importa `wedo` como cualquier paquete estándar de Python, sin requerir conocimientos del núcleo interno.

---

## ⚡ Vista previa de tareas cooperativas

Permite coordinar múltiples acciones a la vez de forma limpia:

```python
from wedo import Hub

with Hub() as hub:
    def parpadear():
        for _ in range(10):
            hub.led.color("yellow")
            hub.task.wait(0.3)
            hub.led.color("red")
            hub.task.wait(0.3)

    def mover():
        motor = hub.motor("A")
        try:
            motor.run(80)
            hub.task.wait(2.0)
        finally:
            motor.stop()

    hub.task.spawn(parpadear)
    hub.task.spawn(mover)
    # Al salir del bloque se espera a que terminen todas las tareas.
```

---

## 📚 Secciones de la documentación

1. [**Instalación**](instalacion.md): Requisitos del sistema, dependencias y configuración Bluetooth en Linux.
2. [**Guía de Inicio Rápido**](guia-rapida.md): Tu primer script en 5 minutos.
3. [**Hardware WeDo 2.0**](hardware.md): Particularidades del firmware oficial, sensores y puertos.
4. [**Referencia de la API**](api/index.md): Documentación exhaustiva de todas las clases y funciones.
5. [**Arquitectura y Seguridad**](arquitectura.md): Explicación del coordinador, watchdog y protocolos.
6. [**Ejemplos Prácticos**](ejemplos.md): Colección de scripts listos para ejecutar.
7. [**Solución de Problemas**](solucion-problemas.md): Respuestas a errores comunes y diagnóstico.
