---
layout: default
title: "API: Periféricos Integrados"
description: Referencia del LED y el botón físico del Smart Hub en los programas del editor (v0.3.0)
prev:
  title: Sensores
  url: /api/sensores.html
next:
  title: Teclado
  url: /api/teclado.html
---

# Periféricos Integrados (LED y botón)

El Smart Hub incorpora un LED multicolor y un botón pulsador integrados en la placa principal. No se seleccionan por puerto: se accede directamente como las propiedades `hub.led` y `hub.button`.

---

## 💡 LED

Se controla mediante un único método `color()`:

```python
hub.led.color("light_green")   # color predefinido por nombre
hub.led.color(255, 0, 0)       # color absoluto (canales rojo, verde y azul)
```

### `color(name)`
Con una cadena selecciona un color predefinido de la paleta del dispositivo:

| Nombre | Color | RGB aproximado |
|---|---|---|
| `"off"` | Apagado | `(0, 0, 0)` |
| `"pink"` | Rosa | `(255, 105, 180)` |
| `"purple"` | Lila / morado | `(128, 0, 128)` |
| `"blue"` | Azul | `(0, 0, 255)` |
| `"light_blue"` | Azul claro | `(173, 216, 230)` |
| `"light_green"` | Verde claro | `(144, 238, 144)` |
| `"dark_green"` | Verde oscuro | `(0, 100, 0)` |
| `"yellow"` | Amarillo | `(255, 255, 0)` |
| `"orange"` | Naranja | `(255, 165, 0)` |
| `"red"` | Rojo | `(255, 0, 0)` |
| `"white"` | Blanco | `(255, 255, 255)` |

- Los nombres se escriben exactamente así (minúsculas, con guion bajo). Un nombre desconocido lanza `ValueError` con un mensaje que lista los colores válidos: `led: color "green" no válido (colores válidos: off, pink, ...)`.
- **No existe el alias `"green"`:** hay dos verdes y elegir uno por el usuario sería ambiguo.
- `color("off")` apaga el LED.
- Los valores RGB de la tabla son **orientativos**. El color predefinido lo determina la paleta del dispositivo, así que `color("red")` no tiene por qué ser idéntico a `color(255, 0, 0)`.

### `color(red, green, blue)`
Con tres enteros establece los canales de 8 bits (0 a 255):

```python
hub.led.color(0, 200, 180)   # turquesa personalizado
```

- Un valor fuera de ese rango lanza `ValueError`; un valor que no sea un entero (incluidos `float` y `bool`) lanza `TypeError`. La API no recorta ni redondea los canales.
- Cualquier otra cantidad de argumentos lanza `TypeError`.
- El índice interno de la paleta (0 a 10) es un detalle del dispositivo y no forma parte de la API.

---

## 🔘 Botón

El botón está integrado en el hub y se accede como la propiedad `hub.button`.

### `read()`
```python
if hub.button.read():
    print("Botón presionado")
```
Devuelve `True` si está presionado y `False` si no lo está.

### `has_change(filter=None)`
```python
if hub.button.has_change():
    print("El estado del botón cambió")
```
Admite estos filtros:

| Filtro | Significado |
|---|---|
| `"pressed"` | El botón pasó a estar presionado |
| `"released"` | El botón pasó a estar liberado |

Como los cambios pendientes se conservan por tipo, una pulsación breve entre dos consultas no se pierde: quedan pendientes tanto `"pressed"` como `"released"`.

### `wait_change(filter=None)`
```python
hub.button.wait_change("pressed")
print("Se presionó el botón")
```
Suspende cooperativamente el flujo actual hasta que llega un cambio. Devuelve el tipo del cambio consumido (`"pressed"` o `"released"`).

---

## 💡 Ejemplo: avanzar hasta pulsar el botón

```python
import wedopy
from wedopy import Hub

with Hub() as hub:
    motor = hub.motor("a")
    button = hub.button

    def run_until_pressed():
        motor.run(50)
        button.wait_change("pressed")
        motor.stop()
        hub.led.color("light_green")

    wedopy.task.spawn(run_until_pressed)

    # El flujo principal puede continuar con otras actividades.
    # Al salir del bloque, se espera a que la tarea termine.
```
