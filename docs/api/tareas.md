---
layout: default
title: "API: Tareas Cooperativas"
description: Concurrencia cooperativa con hub.task en el paquete wedo (v0.2.0)
prev:
  title: Periféricos Integrados
  url: /api/perifericos.html
next:
  title: Excepciones
  url: /api/excepciones.html
---

# Concurrencia cooperativa: `hub.task`

La concurrencia es opcional y está separada de los recursos físicos: los programas lineales no necesitan utilizarla. El espacio de nombres `hub.task` permite iniciar actividades concurrentes y suspenderlas de forma cooperativa:

```python
hub.task.spawn(lambda: print("Actividad concurrente"))

hub.task.wait(1)
```

O guardar una referencia local para escribir menos:

```python
task = hub.task

task.spawn(lambda: task.wait(1))
```

---

## 🚀 Crear una tarea

```python
def movement():
    motor.run(50)
    hub.task.wait(2)
    motor.stop()

task = hub.task.spawn(movement)
```

`hub.task.spawn(fn)` crea y programa una tarea concurrente, y devuelve una referencia a esa tarea (`Task`).

- El argumento debe ser un objeto invocable sin parámetros; cualquier otro tipo lanza `TypeError`. Para pasar argumentos se usa `lambda` o `functools.partial`.
- La tarea se ejecuta de forma independiente del flujo principal, según la planificación cooperativa del runtime. No se garantiza un orden de ejecución entre tareas que estén listas al mismo tiempo.
- `spawn()` no cede el control: la tarea empieza a ejecutarse cuando el que la creó cede o termina.

---

## ⏸️ Esperar cooperativamente

```python
hub.task.wait(1)
```

`hub.task.wait(seconds)` suspende la ejecución actual durante el tiempo indicado, en segundos, sin bloquear a las demás tareas.

- Puede utilizarse tanto desde el flujo principal como desde una tarea creada con `hub.task.spawn()`:
  - **En el flujo principal:** suspende el flujo principal y permite que las tareas concurrentes y el runtime sigan funcionando.
  - **Dentro de una tarea:** suspende únicamente esa tarea y permite que las demás continúen.
- Reglas del argumento: número finito mayor o igual que `0`, con fracciones de segundo admitidas. Un valor negativo, infinito o `NaN` lanza `ValueError`; un valor no numérico, `TypeError`.
- `wait(0)` cede el control al planificador al menos una vez, sin introducir una espera temporal deliberada.
- Desde cualquier otro hilo lanza `RuntimeError`.

> [!WARNING]
> `wait()` es una espera cooperativa. **No debe sustituirse por `time.sleep()` ni por otras llamadas bloqueantes dentro de una tarea**, porque bloquearían también a las demás tareas y al flujo principal.

---

## ⏱️ Medir el tiempo

La API no incluye su propia función de reloj: se usa la biblioteca estándar.

```python
import time

t0 = time.monotonic()
# ...
elapsed = time.monotonic() - t0
```

---

## 🏁 Esperar a que termine una tarea

```python
task = hub.task.spawn(movement)

task.join()
hub.led.color("light_green")
```

`Task.join()` suspende cooperativamente el flujo actual hasta que la tarea termina, ya sea por haber finalizado, haber sido cancelada o haber fallado.

- Si la tarea ya terminó, regresa de inmediato.
- No devuelve valores y **no propaga la excepción** de una tarea fallida; ese error ya se informó por el mecanismo de diagnóstico (ver más abajo).
- Puede usarse desde el flujo principal o desde otra tarea. Una tarea que se une a sí misma lanza `RuntimeError`.

---

## ✋ Cancelar una tarea

```python
task.cancel()
```

`Task.cancel()` solicita cancelar la tarea indicada. La cancelación es cooperativa y se entrega **como una excepción** `TaskCancelled` dentro de la tarea:

- Si la tarea está suspendida en `hub.task.wait()`, en `wait_change()`, en `wait_connection()` o en `join()`, la excepción se lanza en esa llamada y la tarea no continúa con las instrucciones posteriores.
- Si está ejecutando código, la excepción se lanza cuando la tarea cede el control en el siguiente punto cooperativo.
- **La cancelación es persistente:** una vez solicitada, todo punto cooperativo posterior de esa tarea vuelve a lanzar `TaskCancelled`, aunque el código la haya capturado.
- Si la tarea ya terminó, falló o fue cancelada, llamar de nuevo a `cancel()` no produce ningún efecto.
- La cancelación no revierte las acciones que la tarea ya haya realizado sobre los periféricos.

> [!IMPORTANT]
> `TaskCancelled` deriva de `BaseException`, no de `Exception`, de modo que un `except Exception:` no la captura por accidente. Por la misma razón, un `except:` sin tipo o un `except BaseException:` sí la capturaría: deben evitarse en tareas, o volver a lanzar la excepción.

**`cancel()` no detiene automáticamente un motor ni revierte otros efectos.** Un motor que la tarea dejó en marcha sigue girando tras cancelarla. La limpieza se escribe de forma explícita con `try`/`finally`:

```python
def movement():
    try:
        motor.run(50)
        hub.task.wait(10)
    finally:
        motor.stop()

task = hub.task.spawn(movement)
task.cancel()  # el finally detiene el motor
```

Reglas de la limpieza:

- El bloque `finally` (o un `except TaskCancelled` que vuelva a lanzar) se ejecuta cuando se entrega la cancelación.
- **No puede ceder el control:** llamar a `wait()`, `wait_change()`, `wait_connection()` o `join()` durante la limpieza lanza de nuevo `TaskCancelled` (por la persistencia). Las operaciones no cooperativas, como `motor.stop()` o `hub.led.color()`, funcionan con normalidad.
- Un `finally` se ejecuta también cuando la tarea **falla** con una excepción, no solo al cancelarla.

Una tarea que ejecuta un bucle infinito sin ceder nunca el control no puede cancelarse de forma inmediata. Por eso, las tareas deben incluir puntos de espera cooperativa en bucles que puedan prolongarse.

---

## ♻️ Ciclo de vida y errores

Una tarea puede encontrarse internamente en uno de estos estados: programada o ejecutándose, suspendida (en una espera cooperativa), finalizada, cancelada o fallida. No se añade un método público para consultar estos estados en esta versión.

Si una tarea lanza una excepción no capturada:

1. La tarea termina y queda marcada como fallida.
2. El runtime informa del error mediante el módulo `logging` (registrador `"wedo"`, nivel `ERROR`), conservando el mensaje y el *traceback* completo.
3. La excepción no se propaga al código que llamó a `spawn()`, porque la tarea se ejecuta de forma concurrente.
4. El error de una tarea no termina el flujo principal ni cancela automáticamente las demás tareas.

Los errores que deban gestionarse dentro de la propia tarea se capturan con `try`/`except`:

```python
def task_body():
    try:
        ...  # Operaciones que pueden fallar
    except WedoError as error:
        print("Error en la tarea:", error)

hub.task.spawn(task_body)
```

La cancelación no se trata como un error de ejecución y no se notifica como tal.

---

## 🧩 Modelo de ejecución

Las tareas utilizan concurrencia cooperativa:

- **Solo una tarea ejecuta código de usuario a la vez**, y el control cambia únicamente en los puntos cooperativos: `hub.task.wait()`, `wait_change()`, `wait_connection()`, `join()` y las esperas de entrada y salida del `with`.
- No hay carreras de datos entre tareas del mismo hub: entre dos puntos cooperativos, el código se ejecuta sin interrupciones.
- El runtime decide cuándo reanudar las tareas suspendidas y procesa las actualizaciones del dispositivo mientras esperan.
- Cómo se implementa por dentro no forma parte de la API pública.

En esta primera versión no se diferencian tareas normales y tareas de fondo. Tampoco se incluyen prioridades, grupos de tareas, resultados de tareas ni un planificador configurable.

---

## 💡 Ejemplo: avanzar hasta pulsar un botón, con límite de tiempo

```python
from wedo import Hub

with Hub() as hub:
    motor = hub.motor("A")
    button = hub.button

    def drive():
        try:
            motor.run(50)
            button.wait_change("pressed")
        finally:
            motor.stop()

    def limit():
        hub.task.wait(5)
        drive_task.cancel()

    drive_task = hub.task.spawn(drive)
    limit_task = hub.task.spawn(limit)

    drive_task.join()
    limit_task.cancel()
    hub.led.color("light_green")
```

Este ejemplo también ilustra cómo imponer un tiempo límite a una espera sin añadir un parámetro de *timeout* a la API. `limit()` puede referirse a `drive_task` porque `spawn()` no cede el control: ambas tareas empiezan a ejecutarse cuando el flujo principal llega a `join()`, con `drive_task` ya asignada.
