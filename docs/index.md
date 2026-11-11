---
layout: default
title: wedopy-web
description: Editor web para controlar el LEGO WeDo 2.0 Smart Hub desde el navegador, con programas Python (Web Bluetooth + simulador)
next:
  title: Guía de Inicio Rápido
  url: /guia-rapida.html
---

# wedopy-web

**wedopy-web** es un editor web para controlar el **LEGO® WeDo 2.0 Smart Hub** desde el navegador: conecta el hub por **Web Bluetooth** (o usa el **simulador integrado**) y programa en **Python** con una API de alto nivel, pensada para educación, robótica y prototipado. Sin instalar nada: los programas se ejecutan en la propia página con Pyodide.

```python
from wedopy import Hub

with Hub() as hub:
    # Encender el LED en color azul
    hub.led.color("blue")

    # Girar el motor conectado al puerto A
    motor = hub.motor("A")
    motor.run(75)

    print("Dispositivos conectados:", hub.ports())
```

Escribe el programa en el **panel Python** de la aplicación y ejecútalo: corre sobre el hub conectado desde el propio panel (real o simulado), no desde el programa.

---

## 🚀 Características principales

- **API Pythonic y sencilla**: diseñada para ser legible, accesible y didáctica, respetando las mejores prácticas de Python (`with Hub() as hub:`).
- **Selección explícita de puertos**: cada recurso se obtiene por puerto (`hub.motor("A")`, `hub.distance("B")`), sin autodetección implícita: queda claro qué periférico recibe cada orden.
- **Seguridad garantizada por el runtime**: al salir del bloque `with` o al desconectar, se detienen todos los motores. Además, un *watchdog* interno ejecuta una parada de emergencia si la comunicación se corta con motores en marcha.
- **Tareas cooperativas integradas**: concurrencia ligera educativa con `wedopy.task.spawn()` y `wedopy.task.wait()`, sin lidiar con bloqueos de hilos ni con la complejidad sintáctica de `asyncio`.
- **Teclado**: el programa reacciona a las teclas del usuario con `wedopy.key("space")`, mientras la página tiene el foco.
- **Simulador integrado**: permite probar los programas sin hardware, con el mismo código.
- **Validado con el hub real**: control de motores (-100 a +100), sensor de inclinación (direcciones y ejes en grados), sensor de distancia (0 a 10 cm), LED con once colores por nombre y RGB 24-bit, y botón integrado.

---

## 🏛️ Estructura de dos niveles

La arquitectura separa estrictamente las responsabilidades:

| Componente | Lenguaje | Responsabilidad |
| :--- | :--- | :--- |
| **API de los programas** (Python, en Pyodide) | Python | `Hub`, motor, sensores, LED, botón, teclado, tareas y excepciones. |
| **Núcleo interno** | JavaScript | Codecs del protocolo WeDo 2.0, coordinador de cola única BLE, watchdog, máquina de estados y transportes (Web Bluetooth, simulador). |

El programa Python solo usa la API pública; el núcleo interno no forma parte de ella.

---

## ⚡ Vista previa de tareas cooperativas

Permite coordinar múltiples acciones a la vez de forma limpia:

```python
import wedopy
from wedopy import Hub

with Hub() as hub:
    def parpadear():
        for _ in range(10):
            hub.led.color("yellow")
            wedopy.task.wait(0.3)
            hub.led.color("red")
            wedopy.task.wait(0.3)

    def mover():
        motor = hub.motor("A")
        try:
            motor.run(80)
            wedopy.task.wait(2.0)
        finally:
            motor.stop()

    wedopy.task.spawn(parpadear)
    wedopy.task.spawn(mover)
    # Al salir del bloque se espera a que terminen todas las tareas.
```

---

## 📚 Secciones de la documentación

1. [**Guía de Inicio Rápido**](guia-rapida.md): tu primer programa en 5 minutos.
2. [**Hardware WeDo 2.0**](hardware.md): particularidades del firmware oficial, sensores y puertos.
3. [**Referencia de la API**](api/index.md): documentación exhaustiva de todas las clases y funciones disponibles en el editor.
4. [**Arquitectura y Seguridad**](arquitectura.md): explicación del coordinador, watchdog y protocolos.
5. [**Ejemplos Prácticos**](ejemplos.md): colección de programas listos para ejecutar.
6. [**Solución de Problemas**](solucion-problemas.md): respuestas a errores comunes y diagnóstico.
