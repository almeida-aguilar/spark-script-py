---
layout: default
title: "API: Sensores"
description: Referencia de los sensores de distancia e inclinación en el paquete wedo (v0.2.0)
prev:
  title: Motores
  url: /api/motores.html
next:
  title: Periféricos Integrados
  url: /api/perifericos.html
---

# Sensores (distancia e inclinación)

Los dos sensores WeDo 2.0 se seleccionan por puerto y comparten la misma pauta de uso: `read()` para leer el valor actual, `has_change()` para consultar cambios pendientes y `wait_change()` para esperar el próximo cambio.

```python
distance = hub.distance("A")
tilt = hub.tilt("B")
```

---

## 📏 Sensor de distancia

### `read()`
```python
cm = distance.read()
```
Devuelve un número entero en centímetros:

- Rango: `0` a `10` cm.
- Resolución: `1` cm.
- No devuelve valores decimales.
- `0`: obstáculo inmediatamente frente al sensor. `10`: espacio despejado o sin objeto en el rango de detección.

> [!NOTE]
> No son centímetros reales: el dispositivo entrega una escala normalizada de `0` a `10` que la API expone como `int`.

### `has_change(filter=None)`
```python
if distance.has_change():
    print("La distancia ha cambiado")
```
Consulta y consume los cambios pendientes. Devuelve `True` si hay alguno (y lo marca como leído). Admite estos filtros:

| Filtro | Significado |
|---|---|
| `"increase"` | La distancia aumentó; el objeto se alejó |
| `"decrease"` | La distancia disminuyó; el objeto se acercó |

```python
if distance.has_change("increase"):
    print("El objeto se alejó")
elif distance.has_change("decrease"):
    print("El objeto se acercó")
```

### `wait_change(filter=None)`
```python
distance.wait_change("decrease")
print("Algo se acercó")
```
Suspende cooperativamente el flujo actual hasta que llega un cambio (con o sin filtro). Devuelve el tipo del cambio consumido.

---

## 📐 Sensor de inclinación

El sensor de inclinación WeDo 2.0 es un interruptor electromecánico de 4 posiciones que detecta la orientación respecto a la gravedad. El recurso ofrece una lectura direccional y dos ejes (`tilt.x` y `tilt.y`).

### `read()`
```python
direction = tilt.read()
```
Devuelve una de estas cadenas:

| Valor | Significado |
|---|---|
| `"left"` | Inclinación hacia la izquierda |
| `"right"` | Inclinación hacia la derecha |
| `"forward"` | Inclinación hacia delante |
| `"backward"` | Inclinación hacia atrás |
| `"none"` | Sensor en posición horizontal |

### `tilt.x` y `tilt.y`
```python
x = tilt.x.read()
y = tilt.y.read()
```
Cada eje devuelve un ángulo entero, en grados, en el rango de `-45` a `45`.

### Cambios de dirección
```python
if tilt.has_change():
    print("La inclinación ha cambiado")
```
Los filtros indican **la dirección a la que pasó el sensor** (el mismo vocabulario que `read()`):

| Filtro | Significado |
|---|---|
| `"left"` | El sensor pasó a estar inclinado a la izquierda |
| `"right"` | El sensor pasó a estar inclinado a la derecha |
| `"forward"` | El sensor pasó a estar inclinado hacia delante |
| `"backward"` | El sensor pasó a estar inclinado hacia atrás |
| `"none"` | El sensor volvió a la posición horizontal |

### Cambios por eje
```python
if tilt.x.has_change("increase"):
    print("El eje X aumentó")

if tilt.y.has_change("decrease"):
    print("El eje Y disminuyó")
```
Cada eje admite `"increase"` y `"decrease"`. **Cada eje es un recurso independiente:** sus cambios pendientes no se mezclan con los de `tilt` ni con los del otro eje.

### Esperar un cambio
```python
tilt.wait_change("left")
tilt.x.wait_change("increase")
```

---

## ⚠️ Lecturas y cambios

> [!IMPORTANT]
> Los sensores WeDo 2.0 solo notifican cuando el valor cambia:
> - Si el sensor todavía no ha informado su primera lectura, `read()` lanza `NoReadingError` (`distance (puerto "a"): todavía no hay ninguna lectura disponible`). Tras `with Hub()` o `wait_connection()`, los sensores ya conectados han informado su primera lectura.
> - Si un periférico se enchufa más tarde, puede lanzar `NoReadingError` hasta que informe su primer valor.
> - `has_change()` y `wait_change()` no dependen de la primera lectura: responden a los cambios que lleguen a partir de ahora.
> - Un sensor inmóvil no genera cambios: si nada se mueve, `wait_change()` espera indefinidamente.
