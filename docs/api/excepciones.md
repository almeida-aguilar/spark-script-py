---
layout: default
title: "API: Excepciones"
description: Jerarquía de excepciones y gestión de errores en el paquete wedo (v0.2.0)
prev:
  title: Tareas Cooperativas
  url: /api/tareas.html
next:
  title: Arquitectura y Seguridad
  url: /arquitectura.html
---

# Jerarquía de Excepciones

Los errores se expresan mediante excepciones nativas de Python. La API no adopta como convención general el retorno de códigos de error ni introduce un sistema paralelo.

Todas las excepciones públicas pueden importarse desde el paquete raíz:

```python
from wedo import (
    WedoError,
    NotConnectedError,
    ConnectionFailedError,
    PortError,
    NoReadingError,
    TaskCancelled,
)
```

---

## 🌳 Árbol Jerárquico

```
Exception
└── WedoError (Base para todas las excepciones de wedo)
    ├── NotConnectedError (El hub no está conectado o la conexión se perdió)
    ├── ConnectionFailedError (El intento de conexión falló o se agotó el tiempo)
    ├── PortError (Puerto vacío o con un periférico de otro tipo)
    └── NoReadingError (El sensor todavía no ha informado su primera lectura)

BaseException
└── TaskCancelled (La tarea fue cancelada; no es un error de ejecución)
```

Los demás errores usan las excepciones estándar de Python: `ValueError` (fuera de rango, filtro no admitido, color desconocido, puerto no válido), `TypeError` (argumento de tipo o número incorrecto) y `RuntimeError` (espera cooperativa fuera del flujo principal o de una tarea).

---

## 📋 Descripción Detallada

| Situación | Excepción | Mensaje |
|---|---|---|
| Hub no conectado | `NotConnectedError` | `hub no conectado` |
| Nombre de puerto no válido | `ValueError` | `puerto "x" no válido (puertos válidos: a, b)` |
| Puerto vacío | `PortError` | `puerto "a": no hay ningún periférico conectado (se esperaba "motor")` |
| Periférico de otro tipo | `PortError` | `puerto "a": hay un periférico "distance" y se esperaba "motor"` |
| Sin lectura disponible | `NoReadingError` | `distance (puerto "a"): todavía no hay ninguna lectura disponible` |
| Valor fuera de rango | `ValueError` | `motor (puerto "a"): el valor 150 está fuera del rango -100..100` |
| Filtro no admitido | `ValueError` | `button: filtro "pressd" no admitido (admitidos: "pressed", "released")` |
| Color desconocido | `ValueError` | `led: color "green" no válido (colores válidos: off, pink, ...)` |
| Tipo de argumento | `TypeError` | `motor (puerto "a"): run esperaba un número y recibió str` |
| Conexión fallida | `ConnectionFailedError` | `no se pudo conectar con el hub` |
| Tiempo agotado en `with` | `ConnectionFailedError` | `no se pudo conectar con el hub (tiempo de espera agotado: 10 s)` |
| Espera fuera de contexto | `RuntimeError` | `wait solo puede usarse en el flujo principal o dentro de una tarea` |

Los mensajes están en español e identifican el recurso y, cuando existe, el puerto (en minúsculas). La ubicación del error la aporta el *traceback* de Python.

> [!IMPORTANT]
> Los programas **no deben depender del texto exacto**: para distinguir situaciones se capturan los tipos de excepción o se usa la lógica del programa (`hub.ports()`, `hub.wait_connection()`), no el análisis de cadenas.

### `WedoError`
Excepción base para todos los errores generados por la biblioteca. Si deseas capturar cualquier problema originado por `wedo`, captura esta clase.

### `NotConnectedError`
Se lanza al usar un recurso con el hub desconectado, y también cuando la conexión se pierde durante una espera (`wait_change()` termina con ella). Es la excepción más frecuente: cubre tanto el «aún no conectado» como el «se acaba de perder el enlace».

### `ConnectionFailedError`
El intento de conexión falla o es rechazado, o (en el bloque `with`) se agota `connect_timeout`. `wait_connection()` lo lanza para informar del fallo una sola vez.

### `PortError`
Se produce al usar un recurso sobre un puerto donde no hay ningún periférico conectado, o donde hay un periférico de otro tipo. Ejemplo: `hub.motor("A").run(50)` cuando en el puerto A hay un sensor.

### `NoReadingError`
Un sensor todavía no ha informado ninguna lectura. Suele ocurrir con un periférico enchufado después de la conexión: hasta que informe su primer valor, `read()` lanza esta excepción.

### `TaskCancelled`
La cancelación de una tarea se entrega como esta excepción dentro de la tarea (en su siguiente punto cooperativo). **Deriva de `BaseException`, no de `WedoError`**, de modo que un `except Exception:` no la captura por accidente. La cancelación es persistente: tras el pedido, todo punto cooperativo posterior vuelve a lanzarla. Más detalles en [Tareas Cooperativas](tareas.html).

---

## 💡 Ejemplo de manejo de excepciones

```python
from wedo import Hub, ConnectionFailedError, PortError, NoReadingError, WedoError

try:
    with Hub() as hub:
        motor = hub.motor("a")
        sensor = hub.distance("b")
        motor.run(80)

        distancia = sensor.read()
        print("Distancia:", distancia)

except ConnectionFailedError:
    print("No se encontró ningún Smart Hub. ¿Está encendido y parpadea el LED?")
except PortError as error:
    print("Error de puertos:", error)
except NoReadingError:
    print("El sensor aún no ha dado su primera lectura.")
except WedoError as error:
    print("Ocurrió un error en wedo:", error)
```

Para evitar `PortError` se puede consultar antes qué hay en cada puerto:

```python
if hub.ports().get("a") == "motor":
    hub.motor("A").run(50)
```
