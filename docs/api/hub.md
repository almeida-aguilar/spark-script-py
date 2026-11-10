---
layout: default
title: "API: Hub"
description: Referencia completa de la clase Hub en el paquete wedo (v0.2.0)
prev:
  title: Resumen de la API
  url: /api/
next:
  title: Motores
  url: /api/motores.html
---

# Clase `Hub`

La clase `Hub` representa el dispositivo WeDo 2.0 y permite gestionar la conexión y consultar sus puertos. Crear un `Hub()` **no** establece la conexión.

```python
from wedo import Hub
```

---

## 🏗️ Constructor

```python
Hub(*, connect_timeout: float | None = 10.0)
```

- **Parámetros:**
  - `connect_timeout` *(float | None, por defecto `10.0`)*: tiempo máximo, en segundos, que `with Hub() as hub` espera a que se complete la conexión al entrar. Con `None` espera indefinidamente. No afecta a `connect()` ni a `wait_connection()` usados directamente.

Se puede usar de dos formas equivalentes:

```python
# Como gestor de contexto (recomendado)
with Hub() as hub:
    hub.led.color("light_green")

# De forma explícita
hub = Hub()
hub.connect()
try:
    if not hub.wait_connection(10):
        raise SystemExit("No se pudo conectar con el hub")
    hub.led.color("light_green")
finally:
    hub.disconnect()
```

---

## 🔄 Ciclo de vida y conexión

### `connect()`
```python
hub.connect() -> None
```
Inicia el intento de conexión con el hub y **regresa de inmediato**, sin esperar a que se complete. Para esperar el resultado se usa `wait_connection()`.

- Si el hub ya está conectado o ya hay un intento en curso, no hace nada.
- Si el intento falla o es rechazado, el fallo se informa en la siguiente llamada a `wait_connection()`, que lanza `ConnectionFailedError`. Mientras tanto, usar un recurso lanza `NotConnectedError`.
- `disconnect()` aborta un intento en curso.
- Un `Hub` puede volver a conectarse después de haberse desconectado.

### `disconnect()`
```python
hub.disconnect() -> None
```
Cierra la conexión con el hub. Antes de cerrarla, el runtime detiene todos los motores (parada garantizada). Si el hub ya está desconectado, no hace nada.

### `wait_connection(timeout=None)`
```python
hub.wait_connection(timeout: float | None = None) -> bool
```
Suspende cooperativamente el flujo actual hasta que el hub esté conectado o hasta que transcurra el tiempo indicado, en segundos.

- Devuelve `True` si el hub está conectado y `False` si el tiempo se agotó antes.
- Si el hub ya está conectado, devuelve `True` de inmediato.
- `wait_connection(0)` no espera: comprueba el estado actual y devuelve `True` o `False`.
- Sin argumento (`None`), espera indefinidamente.
- El argumento, si se indica, debe ser un número finito mayor o igual que `0`; en caso contrario lanza `ValueError` o `TypeError`.
- No inicia la conexión: solo espera a que se produzca.
- Si el intento iniciado con `connect()` ha fallado, lanza `ConnectionFailedError` en lugar de agotar el tiempo. El fallo se informa una sola vez.

> [!IMPORTANT]
> El hub se considera conectado cuando el enlace está establecido, los periféricos ya conectados a los puertos han sido identificados y sus sensores han informado su primera lectura. Así, cuando `wait_connection()` devuelve `True`, `hub.ports()` es fiable y `read()` no falla por falta de lectura. Un periférico que se enchufe más tarde puede lanzar `NoReadingError` hasta que informe su primer valor.

---

## 🔌 Consultar puertos

### `ports()`
```python
hub.ports() -> dict[str, str]
```
Devuelve un diccionario en el que las claves son los nombres de los puertos en minúsculas (`"a"`, `"b"`) y los valores son cadenas en minúsculas que identifican el tipo de periférico conectado.

```python
ports = hub.ports()

# Ejemplo de resultado:
# {
#     "a": "motor",
#     "b": "distance",
# }
```

- Un puerto vacío se omite del diccionario; `ports.get("a")` devuelve `None` y `ports["a"]` lanza `KeyError`.
- Un periférico cuyo tipo no se reconoce se representa como `"unknown"`.
- Solo incluye periféricos conectados a puertos; el botón y el LED, integrados en el hub, no aparecen.
- Si el hub no está conectado, lanza `NotConnectedError`.

Los tipos de periférico son `"motor"`, `"distance"` y `"tilt"`, idénticos a los nombres de los métodos selectores (`hub.motor`, `hub.distance`, `hub.tilt`).

---

## 🛡️ Seguridad al terminar y al perder la conexión

**Garantizado.** El runtime detiene todos los motores cuando se sale del bloque `with` (con normalidad o por una excepción) y cuando se llama a `hub.disconnect()`.

**Mejor esfuerzo: pérdida inesperada del enlace.** Si la conexión se pierde, la orden de parada no puede enviarse, así que la API **no puede garantizar** que los motores se detengan: depende del comportamiento del propio hub. Al detectar la pérdida, el runtime marca el hub como desconectado, termina con `NotConnectedError` las esperas en curso y hace que las operaciones posteriores lancen `NotConnectedError`. Si el hub se reconecta, el runtime **no reenvía órdenes anteriores**.

---

## ⚙️ Hub como gestor de contexto

`Hub` implementa el protocolo de `with`:

```python
with Hub() as hub:
    motor = hub.motor("A")
    motor.run(50)
    hub.task.wait(2)
    motor.stop()
```

**Al entrar:** llama a `connect()` y espera `connect_timeout` con `wait_connection()`. Si la conexión se completa, devuelve el propio `Hub`. Si el intento falla, es rechazado o se agota el tiempo, lanza `ConnectionFailedError` y el cuerpo del bloque no se ejecuta.

```python
with Hub(connect_timeout=30) as hub:  # más margen para emparejar
    hub.led.color("light_green")
```

**Al salir**, tanto si el bloque termina con normalidad como por una excepción, en este orden:

1. **Salida normal:** espera cooperativamente a que terminen todas las tareas aún en ejecución.
2. **Salida por excepción** (incluida `KeyboardInterrupt`): cancela todas las tareas aún en ejecución y espera a que completen su limpieza.
3. Detiene todos los motores.
4. Desconecta el hub.

`__exit__` **nunca suprime** la excepción que provocó la salida. Entrar con `with` en un hub ya conectado no vuelve a conectar, pero sí lo desconecta al salir.

Una tarea que no termina nunca mantiene bloqueada la salida normal del `with`; en ese caso se interrumpe con `KeyboardInterrupt` (Ctrl+C), que sigue la ruta de la salida por excepción.

> En **wedopy Web** la conexión del hub es del panel de la aplicación, no del programa: al ejecutar un script en el editor, el hub ya está conectado y al terminar el script se detienen los motores y las tareas, pero la conexión no se cierra (quien la cierra es el botón «Desconectar» del panel).
