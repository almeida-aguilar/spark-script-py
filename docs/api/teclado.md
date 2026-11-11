---
layout: default
title: "API: Teclado"
description: Referencia de wedopy.key(name) y la clase Key en los programas Python del editor (v0.3.0)
prev:
  title: Periféricos Integrados
  url: /api/perifericos.html
next:
  title: Tareas Cooperativas
  url: /api/tareas.html
---

# Teclado (`wedopy.key`)

El teclado permite que el programa reaccione a las teclas del usuario. **No forma parte del hub físico**: no requiere crear un `Hub` ni que esté conectado, y sus recursos no aparecen en `hub.ports()`. Se obtiene del módulo, igual que las tareas:

```python
space = wedopy.key("space")
```

`wedopy.key(name)` devuelve el recurso asociado a esa tecla (`Key`). Como en `hub.motor("A")`, el selector no captura nada por sí mismo: devuelve un manejador, y la tecla se consulta con `read()`, `has_change()` o `wait_change()`.

---

## ⌨️ Nombres de tecla

| Grupo | Nombres |
|---|---|
| Letras | `"a"` a `"z"` |
| Dígitos | `"0"` a `"9"` |
| Flechas | `"up"`, `"down"`, `"left"`, `"right"` |
| Especiales | `"space"`, `"enter"`, `"escape"`, `"tab"`, `"backspace"` |
| Modificadoras | `"shift"`, `"control"`, `"alt"` |

- Los nombres se escriben en minúsculas, pero se acepta cualquier combinación: `"A"` y `"a"` seleccionan la misma tecla. La tecla de una letra es independiente de `shift` y del bloqueo de mayúsculas.
- Un nombre que no está en la tabla lanza `ValueError` **al seleccionar la tecla** (`tecla "xx" no válida (teclas válidas: ...)`), porque el conjunto de nombres es cerrado. Un argumento que no sea una cadena lanza `TypeError`.
- Letras y dígitos se identifican por el carácter que produce la tecla según la distribución del teclado del usuario. Los dígitos son los de la fila superior, no los del teclado numérico.
- No se incluyen teclas de función, teclado numérico ni teclas multimedia en esta versión.

---

## 🔘 Leer estado

```python
if space.read():
    print("Barra espaciadora presionada")
```

`Key.read() -> bool` devuelve `True` si la tecla está presionada y `False` si no lo está.

- Todas las teclas parten como no presionadas, y una tecla siempre tiene estado: `read()` nunca lanza `NoReadingError`.
- No requiere conexión del hub: tampoco lanza `NotConnectedError`.

## 🔄 Detectar cambios

```python
if space.has_change("pressed"):
    print("Se pulsó la barra espaciadora")
```

`Key.has_change(filter=None)` admite estos filtros:

| Filtro | Significado |
|---|---|
| `"pressed"` | La tecla pasó a estar presionada |
| `"released"` | La tecla pasó a estar liberada |

Las reglas son las generales de los recursos de entrada: los cambios pendientes se conservan por tipo, `has_change()` los consume y una pulsación breve entre dos consultas no se pierde (quedan pendientes `"pressed"` y `"released"`).

## ⏳ Esperar un cambio

```python
wedopy.key("space").wait_change("pressed")
print("Empezamos")
```

`Key.wait_change(filter=None)` sigue las reglas de los otros recursos. A diferencia de los recursos del hub, las esperas sobre teclas **no** terminan con `NotConnectedError` si el hub se desconecta, porque el teclado no depende de él.

---

## ⚙️ Comportamiento de la captura

- **Ámbito:** solo se capturan las teclas mientras la página que ejecuta el programa tiene el foco. No hay captura global ni se ven las teclas pulsadas en otras aplicaciones.
- **Repetición automática:** una tecla mantenida produce un único `"pressed"`. Las repeticiones que genera el sistema se ignoran.
- **Pérdida del foco:** todas las teclas presionadas pasan a no presionadas y se registra `"released"` para cada una, de modo que ninguna quede «atascada».
- **Varias teclas a la vez:** cada tecla es un recurso independiente y pueden estar presionadas simultáneamente. Algunos teclados físicos no permiten ciertas combinaciones; eso es una limitación del hardware, no de la API.
- **Teclas reservadas:** el navegador puede reservar algunas teclas (atajos del sistema o de la página) y no entregarlas. Una tecla reservada nunca genera cambios y su `read()` devuelve `False`; no es un error.
- **Ciclo de vida:** la captura se activa en el primer uso de cualquier tecla y se libera al terminar el programa (al intérprete). No depende del hub: ni `hub.disconnect()` ni la salida de un bloque `with` la afectan. Los cambios pendientes se descartan al iniciar el programa. Dos manejadores de la misma tecla comparten los mismos cambios pendientes.
- **Teclado no disponible:** si el entorno no puede entregar eventos de pulsación y de liberación (por ejemplo, sin permisos del sistema o sin un mecanismo de captura compatible), usar una tecla lanza `KeyboardUnavailableError`. Seleccionarla no.

---

## 💡 Ejemplos

Mover un motor con las flechas hasta pulsar `q`:

```python
import wedopy
from wedopy import Hub

with Hub() as hub:
    motor = hub.motor("A")
    forward = wedopy.key("up")
    backward = wedopy.key("down")
    stop_key = wedopy.key("q")

    while not stop_key.has_change("pressed"):
        if forward.read():
            motor.run(50)
        elif backward.read():
            motor.run(-50)
        else:
            motor.stop()
        wedopy.task.wait(0.05)
```

Esperar a que el usuario pulse una tecla para empezar (sin necesidad de un `Hub`):

```python
wedopy.key("space").wait_change("pressed")
print("Empezamos")
```
