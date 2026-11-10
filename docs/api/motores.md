---
layout: default
title: "API: Motores"
description: Referencia de la clase Motor en el paquete wedo (v0.2.0)
prev:
  title: Hub
  url: /api/hub.html
next:
  title: Sensores
  url: /api/sensores.html
---

# Motores (`Motor`)

Los motores se seleccionan por puerto:

```python
motor_a = hub.motor("A")
motor_b = hub.motor("B")
```

Los nombres de puerto se escriben con `A` o `B`, aunque no se distinguen mayúsculas de minúsculas.

---

## Clase `Motor`

Representa un motor individual conectado al puerto `"a"` o `"b"`. Se obtiene a través de `hub.motor(port)`.

### Atributos

- **`port`** *(str)*: Nombre del puerto al que está conectado (`"a"` o `"b"`).

### Métodos

#### `run(value)`
```python
motor.run(value: float) -> None
```
Establece la velocidad lógica del motor con un valor firmado entre `-100` y `100`:

| Valor | Comportamiento |
|--:|---|
| `100` | Velocidad máxima en un sentido |
| `50` | Velocidad parcial en ese sentido |
| `0` | Detener el motor |
| `-50` | Velocidad parcial en el sentido contrario |
| `-100` | Velocidad máxima en el sentido contrario |

El signo determina el sentido de giro y el valor absoluto determina la intensidad.

Reglas del argumento:

- Debe ser un `int` o un `float` finito entre `-100` y `100`, ambos incluidos.
- Un valor fuera de ese rango, `NaN` o infinito lanza `ValueError`. La API no recorta el valor en silencio.
- Un valor que no sea numérico (incluidos los `bool`) lanza `TypeError`.
- Si el dispositivo solo admite valores enteros, un valor con parte decimal se redondea al entero más cercano.

```python
# Girar a máxima potencia hacia adelante
motor.run(100)

# Marcha parcial en retroceso
motor.run(-30)
```

> [!NOTE]
> El motor sigue girando con ese valor hasta que se le da otra orden o se aplica alguna de las paradas de seguridad de la sección [Hub](hub.html): fin del bloque `with` o `hub.disconnect()`.

#### `stop()`
```python
motor.stop() -> None
```
Pide parar el motor. Es un alias de `run(0)`: no introduce una operación distinta.

---

## 🔀 Independencia de los motores

Cada motor se controla de manera independiente. Ejecutar una operación sobre un motor no modifica el estado del otro.

```python
motor_a.run(100)
motor_b.run(-100)

motor_a.stop()  # motor_b continúa funcionando
```

No se define un grupo de motores. Si se desea actuar sobre ambos, se realizan dos llamadas explícitas:

```python
motor_a.stop()
motor_b.stop()
```

Esto evita añadir una abstracción de uso limitado y mantiene claro qué periférico recibe cada orden.

---

## ⚠️ Varias tareas sobre un mismo motor

Si dos tareas (o una tarea y el flujo principal) envían órdenes al mismo motor, **prevalece la última orden recibida**. La API no coordina ese acceso: es responsabilidad del programa evitar que varias actividades controlen el mismo motor a la vez.

---

## 💡 Ejemplos de uso

### Control básico con detención segura

```python
from wedo import Hub

with Hub() as hub:
    motor = hub.motor("A")
    try:
        motor.run(75)
        hub.task.wait(2)
    finally:
        motor.stop()
```

### Control de un robot diferencial con dos motores

```python
from wedo import Hub

with Hub() as hub:
    izq = hub.motor("A")
    der = hub.motor("B")

    # Avanzar recto con ambos motores
    izq.run(60)
    der.run(60)
    hub.task.wait(2)

    # Girar sobre su propio eje (rotación diferencial)
    izq.run(50)
    der.run(-50)
    hub.task.wait(1)

    izq.stop()
    der.stop()
```
