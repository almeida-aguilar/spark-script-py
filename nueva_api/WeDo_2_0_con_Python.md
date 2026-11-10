# Wedo — Diseño de la API Python (v3)

**Estado:** especificación de diseño cerrada, traducción de la API Lua v3; pendiente solo de las verificaciones con el dispositivo real (sección 14.2)  
**Entorno objetivo:** Python 3.10 o superior, con acceso al dispositivo Wedo mediante el paquete `wedo`.

---

## 1. Objetivo y filosofía

La API debe sentirse como Python, no como un SDK de otro lenguaje traducido a Python.

Principios:

1. **Minimalista:** exponer las operaciones necesarias sin añadir capas que no aporten valor claro.
2. **Fiel al dispositivo:** representar las capacidades y los valores reales que ofrece el dispositivo.
3. **Explícita:** seleccionar cada periférico conectado indicando el puerto al que está conectado; los recursos integrados en el hub (botón y LED) se acceden directamente.
4. **Idiomática en Python:** utilizar clases, propiedades, métodos, `with`, excepciones nativas, anotaciones de tipo y nombres en `snake_case`.
5. **Predecible:** una operación sobre un recurso no debe modificar otros recursos de forma implícita.
6. **Segura por defecto:** al terminar el programa o salir del bloque `with`, los actuadores no deben quedar en marcha; ante una pérdida de conexión, la API hace lo posible pero no lo puede garantizar (sección 4.5).
7. **Evolución conservadora:** añadir comodidad solo cuando exista una necesidad real y sin ocultar la operación fundamental.

La API pública se limita al control y la lectura de los recursos Wedo. No pretende exponer detalles internos de comunicación.

## 2. Importación

```python
from wedo import Hub
```

`Hub` es la clase principal. Todos los recursos (motores, sensores, botón, LED y tareas) se obtienen a partir de una instancia de `Hub`. Las excepciones públicas se importan del mismo paquete:

```python
from wedo import WedoError, NotConnectedError, PortError
```

Todos los ejemplos de este documento asumen la importación de `Hub`.

## 3. Convenciones generales

### 3.1. Propiedades y métodos

Los recursos que no necesitan argumentos son **propiedades** del hub; los que requieren indicar un puerto son **métodos**:

```python
with Hub() as hub:
    motor = hub.motor("A")      # método: requiere puerto
    button = hub.button         # propiedad: integrado en el hub
    hub.led.color("light_green")      # propiedad
```

Los ejes del sensor de inclinación (`tilt.x`, `tilt.y`) también son propiedades. Los nombres siguen `snake_case`.

### 3.2. Selección explícita del puerto

Todos los periféricos que se conectan a un puerto se seleccionan indicando el puerto:

```python
motor = hub.motor("A")
tilt = hub.tilt("B")
distance = hub.distance("A")
```

No hay autodetección implícita. Un hub puede tener varios periféricos conectados y la selección automática podría ser ambigua.

El botón y el LED están integrados en el propio hub y no se conectan a ningún puerto: se acceden directamente como `hub.button` y `hub.led`. Ninguno recibe nombre de puerto ni aparece en `hub.ports()`.

**El método selector no requiere conexión.** Seleccionar un puerto devuelve un _manejador asociado al puerto_, no a un periférico físico concreto. Por eso es válido crear los manejadores antes de conectar, y guardar un manejador en una variable no crea una copia ni fija un periférico:

- El selector solo valida el nombre del puerto. Si no es un nombre de puerto válido, lanza `ValueError` de inmediato.
- Si el hub no está conectado, el puerto está vacío o contiene un periférico de otro tipo, el error se produce **al usar el manejador** (`run`, `read`, `has_change`, `wait_change`...), no al crearlo.
- Si el periférico se desenchufa y se vuelve a enchufar uno compatible en el mismo puerto, el mismo manejador vuelve a funcionar.

El nombre del puerto es una cadena y se acepta sin distinguir mayúsculas y minúsculas: `"A"` y `"a"` seleccionan el mismo puerto. La forma canónica es la minúscula, que es la que devuelve `hub.ports()`; la tolerancia en el selector es solo una comodidad.

### 3.3. Lecturas

Los valores actuales se consultan con `.read()`:

```python
value = distance.read()
```

Si todavía no existe una lectura válida (por ejemplo, un sensor recién conectado que aún no ha informado ningún valor), `read()` lanza `NoReadingError`. No devuelve un valor inventado ni `None`. Si el hub no está conectado, lanza `NotConnectedError`.

### 3.4. Detección de cambios

Los recursos de entrada exponen `.has_change()`:

```python
if distance.has_change():
    print("La distancia ha cambiado")
```

Cada tipo de cambio que ocurre en un recurso se registra como **cambio pendiente**. `has_change()` consulta los cambios pendientes y **los consume**, de modo que un mismo cambio se informa una sola vez.

Reglas:

- **Sin argumento:** devuelve `True` si hay algún cambio pendiente y los consume todos.
- **Con filtro:** devuelve `True` si hay un cambio pendiente de ese tipo y consume **solo ese tipo**. Los demás tipos pendientes no se ven afectados.
- Devuelve siempre un `bool`.
- El filtro es una cadena. Un filtro que el recurso no admite lanza `ValueError`.
- Si un mismo tipo de cambio ocurre varias veces antes de ser consultado, se registra una única vez (no se cuentan ocurrencias).
- Los tipos distintos se conservan a la vez. Por ejemplo, un botón pulsado y soltado entre dos consultas tiene pendientes `"pressed"` y `"released"`.
- El primer valor leído del dispositivo establece el estado de partida y **no** cuenta como cambio. Antes de que ocurra un cambio, `has_change()` devuelve `False`.
- Los cambios pendientes se descartan al conectar el hub y al desconectarlo.

```python
if distance.has_change("decrease"):
    print("El objeto se está acercando")
```

Los cambios pertenecen al recurso, no al manejador: dos manejadores del mismo puerto comparten los mismos cambios pendientes. Si varias tareas consultan el mismo cambio, solo la primera lo recibe; si necesitan reaccionar todas, deben coordinarse entre ellas.

Los filtros admitidos dependen del recurso y se detallan en sus secciones.

### 3.5. Esperar un cambio

Los recursos de entrada exponen también `.wait_change()`, que suspende la ejecución de forma cooperativa hasta que haya un cambio pendiente:

```python
hub.button.wait_change("pressed")
```

Reglas:

- Acepta los mismos filtros que `has_change()`.
- Si ya hay un cambio pendiente que coincide, lo consume y regresa sin esperar.
- Devuelve una cadena (`str`) con el tipo de cambio consumido (`"pressed"`, `"increase"`, etc.).
- Sin filtro, espera a cualquier cambio, devuelve el más antiguo de los pendientes y consume **solo ese**.
- Si varias tareas esperan el mismo cambio, se reanuda una sola: la que lleva más tiempo esperando.
- Como `hub.task.wait()`, solo puede usarse en el flujo principal o dentro de una tarea (sección 11), y es una espera cooperativa: no equivale a `time.sleep()`.
- Si el hub se desconecta mientras se espera, la espera termina con `NotConnectedError`.
- No tiene tiempo límite. Para limitar la espera, ejecuta la espera en una tarea y cancélala (sección 11.5).

`wait_change()` evita escribir bucles de sondeo y no pierde cambios breves entre consultas. El sondeo con `read()` sigue siendo válido cuando se quiere el estado actual y no un evento.

### 3.6. Booleanos, nombres y tipos

Las consultas cuyo resultado es booleano utilizan nombres `is_*()` cuando corresponde. Por ahora no hay ninguna: `has_change()` mantiene su nombre por ser un verbo de detección de eventos, y `Hub.wait_connection()` devuelve un `bool` porque es una espera con límite de tiempo.

Los argumentos que representan opciones o categorías se expresan como cadenas.

Todas las clases y métodos públicos llevan anotaciones de tipo. Los argumentos de tipo incorrecto lanzan `TypeError`; los de tipo correcto pero valor no válido, `ValueError`. Los valores `bool` no se aceptan donde se espera un número.

### 3.7. Errores

Los errores se expresan mediante excepciones nativas de Python. La API no adopta como convención general el retorno de códigos de error ni introduce un sistema paralelo.

Las excepciones propias derivan de `WedoError` (que a su vez deriva de `Exception`):

|Situación|Excepción|
|---|---|
|Nombre de puerto no válido|`ValueError`|
|Usar un recurso con el hub desconectado, o desconexión durante una espera|`NotConnectedError`|
|Puerto vacío o periférico de otro tipo|`PortError`|
|El intento de conexión falla, es rechazado o (en `with`) se agota el tiempo|`ConnectionFailedError`|
|Lectura aún no disponible|`NoReadingError`|
|Valor fuera de rango, filtro no admitido o color desconocido|`ValueError`|
|Argumento de tipo incorrecto o número de argumentos incorrecto|`TypeError`|
|Espera cooperativa fuera del flujo principal o de una tarea|`RuntimeError`|
|Cancelación de una tarea|`TaskCancelled` (deriva de `BaseException`, no de `WedoError`)|

El usuario puede capturarlos con `try`/`except`:

```python
try:
    hub.motor("A").run(50)
except PortError as error:
    print("El puerto A no tiene un motor:", error)
```

Para evitar el error se puede consultar antes qué hay en cada puerto:

```python
if hub.ports().get("a") == "motor":
    hub.motor("A").run(50)
```

### 3.8. Formato de los mensajes de error

Toda función pública valida sus argumentos y lanza una excepción en lugar de corregirlos en silencio (tipos, rangos, filtros, nombres de puerto o de color, número de argumentos).

Los mensajes están en español, son idénticos a los de la versión Lua y siguen estos formatos, que identifican el recurso y, cuando existe, el puerto (en su forma canónica, en minúsculas). La ubicación del error la aporta el _traceback_ de Python.

|Situación|Excepción|Mensaje|
|---|---|---|
|Hub no conectado|`NotConnectedError`|`hub no conectado`|
|Nombre de puerto no válido|`ValueError`|`puerto "x" no válido (puertos válidos: a, b)`|
|Puerto vacío|`PortError`|`puerto "a": no hay ningún periférico conectado (se esperaba "motor")`|
|Periférico de otro tipo|`PortError`|`puerto "a": hay un periférico "distance" y se esperaba "motor"`|
|Sin lectura disponible|`NoReadingError`|`distance (puerto "a"): todavía no hay ninguna lectura disponible`|
|Valor fuera de rango|`ValueError`|`motor (puerto "a"): el valor 150 está fuera del rango -100..100`|
|Filtro no admitido|`ValueError`|`button: filtro "pressd" no admitido (admitidos: "pressed", "released")`|
|Color desconocido|`ValueError`|`led: color "green" no válido (colores válidos: off, pink, ...)`|
|Tipo de argumento|`TypeError`|`motor (puerto "a"): run esperaba un número y recibió str`|
|Conexión fallida|`ConnectionFailedError`|`no se pudo conectar con el hub`|
|Tiempo agotado en `with`|`ConnectionFailedError`|`no se pudo conectar con el hub (tiempo de espera agotado: 10 s)`|
|Espera fuera de contexto|`RuntimeError`|`wait solo puede usarse en el flujo principal o dentro de una tarea`|

El texto exacto puede refinarse, pero los programas **no deben depender de él**: para distinguir situaciones se capturan los tipos de excepción o se usa la lógica del programa (`hub.ports()`, `hub.wait_connection()`), no el análisis de cadenas.

---

## 4. Hub

La clase `Hub` representa el dispositivo Wedo y permite gestionar la conexión y consultar sus puertos. Crear un `Hub()` **no** establece la conexión.

```python
Hub(*, connect_timeout: float | None = 10.0)
```

`connect_timeout` es el tiempo máximo, en segundos, que `with Hub() as hub` espera a que se complete la conexión al entrar (sección 4.6). Con `None` espera indefinidamente. Sigue las mismas reglas de validación que el argumento de `wait_connection()`. No afecta a `connect()` ni a `wait_connection()` usados directamente.

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

### 4.1. Conectar

```python
hub.connect()
```

Inicia el intento de conexión con el hub y **regresa de inmediato**, sin esperar a que se complete. Para esperar el resultado se usa `wait_connection()` (sección 4.3):

```python
hub.connect()
if hub.wait_connection(10):
    print("Hub conectado")
```

- Si el hub ya está conectado o ya hay un intento en curso, no hace nada.
- Si el intento falla o es rechazado, el fallo se informa en la siguiente llamada a `wait_connection()`, que lanza `ConnectionFailedError`. Mientras tanto, usar un recurso lanza `NotConnectedError`.
- `disconnect()` aborta un intento en curso.
- Un `Hub` puede volver a conectarse después de haberse desconectado.

Si la conexión la inicia otra parte de la aplicación, no hace falta llamar a `connect()`: basta con `wait_connection()`.

### 4.2. Desconectar

```python
hub.disconnect()
```

Cierra la conexión con el hub. Antes de cerrarla, el runtime detiene todos los motores (sección 4.5). Si el hub ya está desconectado, no hace nada.

### 4.3. Esperar la conexión

```python
if hub.wait_connection(10):
    print("Hub conectado")
else:
    print("No se conectó en 10 segundos")
```

`Hub.wait_connection(timeout: float | None = None) -> bool` suspende cooperativamente el flujo actual hasta que el hub esté conectado o hasta que transcurra el tiempo indicado, expresado en segundos.

- Devuelve `True` si el hub está conectado y `False` si el tiempo se agotó antes de que lo estuviera.
- Si el hub ya está conectado, devuelve `True` de inmediato.
- `wait_connection(0)` no espera: comprueba el estado actual y devuelve `True` o `False`. Es la forma de consultar la conexión sin suspender el flujo.
- Sin argumento (`None`), espera indefinidamente.
- El argumento, si se indica, debe ser un número finito mayor o igual que `0`, con las mismas reglas que `hub.task.wait()`. Un valor negativo, infinito o `NaN` lanza `ValueError`; un valor no numérico, `TypeError`.
- No inicia la conexión: solo espera a que se produzca.
- Si el intento iniciado con `connect()` ha fallado o fue rechazado, lanza `ConnectionFailedError` en lugar de esperar a que se agote el tiempo. El fallo se informa una sola vez.
- Como `hub.task.wait()`, solo puede usarse en el flujo principal o dentro de una tarea, y es una espera cooperativa.

Un tiempo agotado no es un error, sino un resultado esperable, por lo que se informa con `False` y no con una excepción. (El bloque `with` sí lo convierte en excepción, porque no tiene sentido ejecutar el cuerpo sin conexión; sección 4.6.)

**Qué significa «conectado».** El hub se considera conectado cuando el enlace está establecido, los periféricos ya conectados a los puertos han sido identificados y sus sensores han informado su primera lectura. Así, cuando `wait_connection()` devuelve `True`, `hub.ports()` es fiable y `read()` no falla por falta de lectura. Un periférico que se enchufe más tarde puede lanzar `NoReadingError` hasta que informe su primer valor.

No es obligatorio comprobar la conexión antes de cada operación. Si una operación no puede realizarse por el estado de conexión, lanza `NotConnectedError`.

### 4.4. Consultar puertos

```python
ports = hub.ports()

print(ports.get("a"))
print(ports.get("b"))
```

Devuelve un `dict[str, str]` en el que las claves son los nombres de los puertos en minúsculas (`"a"`, `"b"`, etc.) y los valores son cadenas en minúsculas que identifican el tipo de periférico conectado.

- Un puerto vacío se omite del diccionario; por tanto, `ports.get("a")` devuelve `None` y `ports["a"]` lanza `KeyError`.
- Un periférico conectado cuyo tipo no se reconoce se representa como `"unknown"`.
- Solo incluye periféricos conectados a puertos; el botón y el LED, integrados en el hub, no aparecen.
- Si el hub no está conectado, lanza `NotConnectedError`.

Ejemplo ilustrativo:

```python
ports = hub.ports()

# Ejemplo de resultado:
# {
#     "a": "motor",
#     "b": "distance",
# }
```

Los tipos de periférico son `"motor"`, `"distance"` y `"tilt"`, idénticos a los nombres de los métodos selectores (`hub.motor`, `hub.distance`, `hub.tilt`). Si se incorporan nuevos periféricos, su tipo deberá coincidir también con su método selector.

### 4.5. Seguridad al terminar y al perder la conexión

**Garantizado.** El runtime detiene todos los motores en estos casos:

- se sale del bloque `with` (con normalidad o por una excepción);
- se llama a `hub.disconnect()`.

Esta parada es una garantía del runtime, no una operación de la API: no aparece como método y no sustituye a `motor.stop()` durante la ejecución normal.

**Mejor esfuerzo: fin del intérprete.** Si el intérprete termina con el hub aún conectado, el runtime intenta detener los motores y desconectar mediante un cierre registrado con `atexit`. No está garantizado ante una terminación abrupta del proceso (por ejemplo, una señal que no puede interceptarse).

**Mejor esfuerzo: pérdida inesperada de la conexión.** Si el enlace se pierde, la orden de parada no puede enviarse, por lo que la API **no puede garantizar** que los motores se detengan: depende del comportamiento del propio hub. Al detectar la pérdida, el runtime:

- marca el hub como desconectado;
- termina con `NotConnectedError` las esperas en curso (`wait_change()`);
- hace que las operaciones posteriores sobre recursos lancen `NotConnectedError`;
- no cancela las tareas.

Si el hub se reconecta, el runtime **no reenvía órdenes anteriores**: el programa debe volver a dar explícitamente las órdenes a los motores.

### 4.6. Hub como gestor de contexto

`Hub` implementa el protocolo de `with`:

```python
with Hub() as hub:
    motor = hub.motor("A")
    motor.run(50)
    hub.task.wait(2)
    motor.stop()
```

**Al entrar** (`__enter__`):

- Llama a `connect()` y después a `wait_connection(connect_timeout)`, donde `connect_timeout` es el argumento del constructor (10 segundos por defecto; `None` espera indefinidamente).
- Si la conexión se completa, devuelve el propio `Hub`.
- Si el intento falla, es rechazado o se agota el tiempo, aborta el intento y lanza `ConnectionFailedError`. El cuerpo del bloque no se ejecuta y `__exit__` no se llama, de modo que no queda una conexión a medias.
- Si el hub ya estaba conectado, `wait_connection()` devuelve `True` de inmediato.

```python
with Hub(connect_timeout=30) as hub:  # más margen para emparejar
    hub.led.color("light_green")
```

**Al salir** (`__exit__`), tanto si el bloque termina con normalidad como por una excepción, en este orden:

1. **Salida normal:** espera cooperativamente a que terminen todas las tareas aún en ejecución, de forma análoga a `asyncio.TaskGroup`. El bloque `with` equivale al "programa" de la versión Lua: acaba cuando terminan el flujo principal y todas sus tareas.
2. **Salida por excepción** (incluida `KeyboardInterrupt`): cancela todas las tareas aún en ejecución y espera a que completen su limpieza (sección 11.5). No se espera a que terminen por sí solas.
3. Detiene todos los motores (sección 4.5).
4. Desconecta el hub.

`__exit__` **nunca suprime** la excepción que provocó la salida: se propaga con normalidad.

Entrar con `with` en un hub ya conectado no vuelve a conectar (la espera es inmediata), pero sí lo desconecta al salir. Un `Hub` puede reutilizarse en un nuevo `with` después de haber salido.

Una tarea que no termina nunca (por ejemplo, un `while True` con esperas) mantiene bloqueada la salida normal del `with`; en ese caso se interrumpe con `KeyboardInterrupt` (Ctrl+C), que sigue la ruta de la salida por excepción.

---

## 5. Motores

Los motores se seleccionan por puerto:

```python
motor_a = hub.motor("A")
motor_b = hub.motor("B")
```

### 5.1. Ejecutar

```python
motor_a.run(50)
motor_b.run(-50)
```

`Motor.run(value: float) -> None` recibe un valor firmado entre `-100` y `100`:

|Valor|Comportamiento|
|--:|---|
|`100`|Velocidad máxima en un sentido|
|`50`|Velocidad parcial en ese sentido|
|`0`|Detener el motor|
|`-50`|Velocidad parcial en el sentido contrario|
|`-100`|Velocidad máxima en el sentido contrario|

El signo determina el sentido de giro y el valor absoluto determina la intensidad.

Reglas del argumento:

- Debe ser un `int` o un `float` finito entre `-100` y `100`, ambos incluidos.
- Un valor fuera de ese rango, `NaN` o infinito lanza `ValueError`. La API no recorta el valor en silencio.
- Un valor que no sea numérico (incluidos los `bool`) lanza `TypeError`.
- Si el dispositivo solo admite valores enteros, un valor con parte decimal se redondea al entero más cercano.

El motor sigue girando con ese valor hasta que se le da otra orden o se aplica alguna de las paradas de la sección 4.5.

### 5.2. Detener

```python
motor_a.stop()
```

`stop()` es un alias de `run(0)`. No introduce una operación distinta.

### 5.3. Independencia de los motores

Cada motor se controla de manera independiente. Ejecutar una operación sobre un motor no modifica el estado del otro.

```python
motor_a.run(100)
motor_b.run(-100)

motor_a.stop()  # motor_b continúa funcionando
```

No se define un grupo de motores. Si se desea actuar sobre ambos motores, se realizan dos llamadas explícitas:

```python
motor_a.stop()
motor_b.stop()
```

Esto evita añadir una abstracción de uso limitado y mantiene claro qué periférico recibe cada orden.

### 5.4. Varias tareas sobre un mismo motor

Si dos tareas (o una tarea y el flujo principal) envían órdenes al mismo motor, **prevalece la última orden recibida**. La API no coordina ese acceso: es responsabilidad del programa evitar que varias actividades controlen el mismo motor a la vez.

---

## 6. Sensor de distancia

Se selecciona por puerto:

```python
distance = hub.distance("A")
```

### 6.1. Leer distancia

```python
cm = distance.read()
print(cm)
```

`Distance.read() -> int` devuelve un número entero en centímetros.

- Rango: `0` a `10` cm.
- Resolución: `1` cm.
- No devuelve valores decimales.

### 6.2. Detectar cambios

```python
if distance.has_change():
    print("La distancia ha cambiado")
```

Admite estos filtros:

|Filtro|Significado|
|---|---|
|`"increase"`|La distancia aumentó; el objeto se alejó|
|`"decrease"`|La distancia disminuyó; el objeto se acercó|

Ejemplo:

```python
if distance.has_change("increase"):
    print("El objeto se alejó")
elif distance.has_change("decrease"):
    print("El objeto se acercó")
```

### 6.3. Esperar un cambio

```python
change = distance.wait_change("decrease")
print("Algo se acercó")
```

---

## 7. Sensor de inclinación

Se selecciona por puerto:

```python
tilt = hub.tilt("A")
```

El recurso ofrece una lectura direccional y dos ejes.

### 7.1. Leer dirección

```python
direction = tilt.read()
print(direction)
```

`Tilt.read() -> str` devuelve una de estas cadenas:

|Valor|Significado|
|---|---|
|`"left"`|Inclinación hacia la izquierda|
|`"right"`|Inclinación hacia la derecha|
|`"forward"`|Inclinación hacia delante|
|`"backward"`|Inclinación hacia atrás|
|`"none"`|Sensor en posición horizontal|

### 7.2. Leer ejes

```python
x = tilt.x.read()
y = tilt.y.read()
```

Cada eje devuelve un ángulo en el rango de `-45` a `45` grados.

`TiltAxis.read() -> int` devuelve números enteros, en grados.

### 7.3. Detectar cambios de dirección

```python
if tilt.has_change():
    print("La inclinación ha cambiado")
```

Admite estos filtros, que indican **la dirección a la que pasó el sensor**:

|Filtro|Significado|
|---|---|
|`"left"`|El sensor pasó a estar inclinado a la izquierda|
|`"right"`|El sensor pasó a estar inclinado a la derecha|
|`"forward"`|El sensor pasó a estar inclinado hacia delante|
|`"backward"`|El sensor pasó a estar inclinado hacia atrás|
|`"none"`|El sensor volvió a la posición horizontal|

Con esto, el valor de `tilt.read()` y los filtros de `has_change()` usan el mismo vocabulario.

### 7.4. Detectar cambios por eje

```python
if tilt.x.has_change("increase"):
    print("El eje X aumentó")

if tilt.y.has_change("decrease"):
    print("El eje Y disminuyó")
```

Cada eje admite:

- `"increase"`
- `"decrease"`

Cada eje es un recurso independiente: sus cambios pendientes no se mezclan con los de `tilt` ni con los del otro eje.

### 7.5. Esperar un cambio

```python
tilt.wait_change("left")
tilt.x.wait_change("increase")
```

---

## 8. Botón

El botón está integrado en el hub: no se selecciona por puerto y se accede directamente como la propiedad `hub.button`, igual que `hub.led`.

```python
button = hub.button  # opcional: referencia al mismo recurso, no una copia
```

### 8.1. Leer estado

```python
if button.read():
    print("Botón presionado")
```

`Button.read() -> bool` devuelve:

- `True`: presionado.
- `False`: no presionado.

### 8.2. Detectar cambios

```python
if button.has_change():
    print("El estado del botón cambió")
```

Admite estos filtros:

|Filtro|Significado|
|---|---|
|`"pressed"`|El botón pasó a estar presionado|
|`"released"`|El botón pasó a estar liberado|

Ejemplo:

```python
if button.has_change("pressed"):
    print("Se presionó el botón")
elif button.has_change("released"):
    print("Se soltó el botón")
```

Como los cambios pendientes se conservan por tipo, una pulsación breve entre dos consultas no se pierde: quedan pendientes tanto `"pressed"` como `"released"`.

### 8.3. Esperar un cambio

```python
button.wait_change("pressed")
```

---

## 9. LED

El LED es un recurso integrado en el hub: no se selecciona por puerto y se accede directamente como la propiedad `hub.led`.

Se controla mediante un único método `color()`:

```python
hub.led.color("light_green")
```

También admite valores RGB:

```python
hub.led.color(255, 0, 0)
```

Cada canal RGB acepta un **`int`** entre `0` y `255`. Un valor fuera de ese rango lanza `ValueError`; un valor que no sea un entero (incluidos `float` y `bool`) lanza `TypeError`. La API no recorta ni redondea los canales.

La forma con una cadena selecciona un color predefinido de la paleta del dispositivo. La forma con tres números establece los canales rojo, verde y azul. Cualquier otra cantidad de argumentos lanza `TypeError`.

### 9.1. Colores predefinidos

|Nombre|Color|RGB aproximado|
|---|---|---|
|`"off"`|Apagado|`(0, 0, 0)`|
|`"pink"`|Rosa|`(255, 105, 180)`|
|`"purple"`|Lila / morado|`(128, 0, 128)`|
|`"blue"`|Azul|`(0, 0, 255)`|
|`"light_blue"`|Azul claro|`(173, 216, 230)`|
|`"light_green"`|Verde claro|`(144, 238, 144)`|
|`"dark_green"`|Verde oscuro|`(0, 100, 0)`|
|`"yellow"`|Amarillo|`(255, 255, 0)`|
|`"orange"`|Naranja|`(255, 165, 0)`|
|`"red"`|Rojo|`(255, 0, 0)`|
|`"white"`|Blanco|`(255, 255, 255)`|

- Los nombres se escriben exactamente así (minúsculas, con guion bajo). Un nombre desconocido lanza `ValueError` con un mensaje que lista los colores válidos.
- No existe el alias `"green"`: hay dos verdes y elegir uno por el usuario sería ambiguo.
- Los valores RGB de la tabla son **orientativos**. El color predefinido lo determina la paleta del dispositivo, así que `color("red")` no tiene por qué ser idéntico a `color(255, 0, 0)`.
- El índice interno de la paleta (0 a 10) es un detalle del dispositivo y no forma parte de la API.
- `color("off")` apaga el LED.

---

## 10. Ejemplo integrado

El siguiente ejemplo utiliza un motor en el puerto A y el botón integrado del hub. Los nombres de puerto pueden escribirse en mayúsculas o minúsculas, y los manejadores pueden crearse antes de que el cuerpo del `with` use el hub.

```python
from wedo import Hub

with Hub() as hub:
    motor = hub.motor("a")
    button = hub.button

    def run_until_pressed():
        motor.run(50)
        button.wait_change("pressed")
        motor.stop()
        hub.led.color("light_green")

    hub.task.spawn(run_until_pressed)

    # El flujo principal puede continuar con otras actividades.
    # Al salir del bloque, se espera a que la tarea termine.
```

---

## 11. Concurrencia cooperativa: `hub.task`

La concurrencia es opcional y está separada de los recursos físicos. Los programas lineales no necesitan utilizar esta sección.

El espacio de nombres `hub.task` permite iniciar actividades concurrentes y suspenderlas de forma cooperativa:

```python
hub.task.spawn(lambda: print("Actividad concurrente"))

hub.task.wait(1)
```

O guardar una referencia local para escribir menos:

```python
task = hub.task

task.spawn(lambda: task.wait(1))
```

### 11.1. Crear una tarea

```python
def movement():
    motor.run(50)
    hub.task.wait(2)
    motor.stop()

task = hub.task.spawn(movement)
```

`hub.task.spawn(fn)` crea y programa una tarea concurrente, y devuelve una referencia a esa tarea (`Task`). El argumento debe ser un objeto invocable sin parámetros; cualquier otro tipo lanza `TypeError`. Para pasar argumentos se usa `lambda` o `functools.partial`.

La tarea se ejecuta de forma independiente del flujo principal, según la planificación cooperativa del runtime. No se garantiza un orden de ejecución entre tareas que estén listas al mismo tiempo. `spawn()` no cede el control: la tarea empieza a ejecutarse cuando el que la creó cede o termina.

### 11.2. Esperar cooperativamente

```python
hub.task.wait(1)
```

`hub.task.wait(seconds: float) -> None` suspende la ejecución actual durante el tiempo indicado, expresado en segundos, sin bloquear a las demás tareas.

Puede utilizarse tanto desde el flujo principal como desde una tarea creada con `hub.task.spawn()`:

- **En el flujo principal:** suspende el flujo principal y permite que las tareas concurrentes y el runtime sigan funcionando. El flujo principal es el hilo que creó el `Hub`.
- **Dentro de una tarea:** suspende únicamente esa tarea y permite que las demás continúen ejecutándose.

Reglas del argumento:

- Debe ser un número finito mayor o igual que `0`.
- Se admiten fracciones de segundo.
- `wait(0)` cede el control al planificador al menos una vez, sin introducir una espera temporal deliberada.
- Un valor negativo, infinito o `NaN` lanza `ValueError`; un valor no numérico, `TypeError`.

`wait()` solo puede utilizarse dentro del flujo principal o dentro de una tarea. Desde cualquier otro hilo lanza `RuntimeError`.

`wait()` es una espera cooperativa. **No debe sustituirse por `time.sleep()` ni por otras llamadas bloqueantes dentro de una tarea**, porque bloquearían también a las demás tareas y al flujo principal (sección 13).

### 11.3. Medir el tiempo

La versión Lua incluía `wedo.task.now()` porque `os` no estaba disponible. En Python no hace falta duplicarlo: se usa la biblioteca estándar.

```python
import time

t0 = time.monotonic()
# ...
elapsed = time.monotonic() - t0
```

### 11.4. Esperar a que termine una tarea

```python
task = hub.task.spawn(movement)

task.join()
hub.led.color("light_green")
```

`Task.join() -> None` suspende cooperativamente el flujo actual hasta que la tarea termina, ya sea por haber finalizado, haber sido cancelada o haber fallado.

- Si la tarea ya terminó, regresa de inmediato.
- No devuelve valores y **no propaga la excepción** de una tarea fallida; ese error ya se informó por el mecanismo de diagnóstico (sección 11.6).
- Puede usarse desde el flujo principal o desde otra tarea. Una tarea que se une a sí misma lanza `RuntimeError`.

### 11.5. Cancelar una tarea

```python
task.cancel()
```

`Task.cancel() -> None` solicita cancelar la tarea indicada. La cancelación es cooperativa y se entrega **como una excepción** `TaskCancelled` dentro de la tarea:

- Si la tarea está suspendida en `hub.task.wait()`, en `wait_change()`, en `wait_connection()` o en `join()`, la excepción se lanza en esa llamada y la tarea no continúa con las instrucciones posteriores.
- Si está ejecutando código, la excepción se lanza cuando la tarea cede el control en el siguiente punto cooperativo.
- La cancelación es persistente: una vez solicitada, **todo** punto cooperativo posterior de esa tarea vuelve a lanzar `TaskCancelled`, aunque el código la haya capturado.
- Si la tarea ya terminó, falló o fue cancelada, llamar de nuevo a `cancel()` no produce ningún efecto.
- La cancelación no revierte las acciones que la tarea ya haya realizado sobre los periféricos.

`TaskCancelled` deriva de `BaseException`, no de `Exception`, de modo que un `except Exception:` no la captura por accidente. Por la misma razón, un `except:` sin tipo o un `except BaseException:` sí la capturaría: deben evitarse en tareas, o volver a lanzar la excepción.

Una tarea que ejecuta un bucle infinito sin ceder nunca el control no puede cancelarse de forma inmediata. Por eso, las tareas deben incluir puntos de espera cooperativa en bucles que puedan prolongarse.

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
- **No puede ceder el control:** llamar a `wait()`, `wait_change()`, `wait_connection()` o `join()` durante la limpieza lanza de nuevo `TaskCancelled` (por la persistencia descrita arriba). Las operaciones no cooperativas, como `motor.stop()` o `hub.led.color()`, funcionan con normalidad.
- Un `finally` se ejecuta también cuando la tarea **falla** con una excepción, no solo al cancelarla. Esto cubre el caso de una tarea que deja un motor en marcha y después falla, que en la versión Lua requería un mecanismo aparte (`on_cancel`) que aquí no hace falta.

### 11.6. Ciclo de vida y errores

Una tarea puede encontrarse internamente en uno de estos estados:

- **Programada o ejecutándose:** todavía no ha terminado.
- **Suspendida:** está esperando mediante `hub.task.wait()`, `wait_change()`, `wait_connection()` o `join()`.
- **Finalizada:** la función terminó normalmente.
- **Cancelada:** se completó una solicitud de cancelación.
- **Fallida:** la función lanzó una excepción no capturada.

No se añade un método público para consultar estos estados en esta versión. `spawn()` devuelve una referencia para poder cancelar la tarea y esperar a que termine, no un objeto de gestión completo.

Si una tarea lanza una excepción no capturada:

1. La tarea termina y queda marcada como fallida.
2. El runtime informa del error mediante el módulo `logging` (registrador `"wedo"`, nivel `ERROR`), conservando el mensaje y el _traceback_ completo.
3. La excepción no se propaga al código que llamó a `spawn()`, porque la tarea se ejecuta de forma concurrente.
4. El error de una tarea no debe terminar el flujo principal ni cancelar automáticamente las demás tareas.

Los errores que deban gestionarse dentro de la propia tarea se capturan con `try`/`except`:

```python
def task_body():
    try:
        ...  # Operaciones que pueden fallar
    except WedoError as error:
        print("Error en la tarea:", error)

hub.task.spawn(task_body)
```

La cancelación no se trata como un error de ejecución y no debe notificarse como tal.

### 11.7. Modelo de ejecución

Las tareas utilizan concurrencia cooperativa:

- **Solo una tarea ejecuta código de usuario a la vez**, y el control cambia únicamente en los puntos cooperativos: `hub.task.wait()`, `wait_change()`, `wait_connection()`, `join()` y las esperas de entrada y salida del `with`.
- No hay carreras de datos entre tareas del mismo hub: entre dos puntos cooperativos, el código se ejecuta sin interrupciones.
- El flujo principal también está administrado por el runtime y puede ceder el control en esos mismos puntos.
- El runtime decide cuándo reanudar las tareas suspendidas y procesa las actualizaciones del dispositivo mientras esperan.
- Cómo se implementa por dentro (hilos con un testigo de ejecución único, _greenlets_, un bucle de `asyncio` interno u otro mecanismo) no forma parte de la API pública.

En esta primera versión no se diferencian tareas normales y tareas de fondo. Tampoco se incluyen prioridades, grupos de tareas, resultados de tareas ni un planificador configurable.

### 11.8. Ejemplo: avanzar hasta pulsar un botón, con límite de tiempo

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

Este ejemplo también ilustra cómo imponer un tiempo límite a una espera sin añadir un parámetro de _timeout_ a la API. `limit()` puede referirse a `drive_task` porque `spawn()` no cede el control: ambas tareas empiezan a ejecutarse cuando el flujo principal llega a `join()`, con `drive_task` ya asignada.

---

## 12. Resumen de la API pública

|Recurso|Acceso|Miembros|
|---|---|---|
|Hub|`Hub(connect_timeout=10.0)`|`connect()`, `disconnect()`, `wait_connection(timeout=None)`, `ports()`, `with Hub() as hub`|
|Motor|`hub.motor("A")`|`run(value)`, `stop()`|
|Distancia|`hub.distance("A")`|`read()`, `has_change(filter=None)`, `wait_change(filter=None)`|
|Inclinación|`hub.tilt("A")`|`read()`, `has_change(filter=None)`, `wait_change(filter=None)`|
|Eje X|`tilt.x`|`read()`, `has_change(filter=None)`, `wait_change(filter=None)`|
|Eje Y|`tilt.y`|`read()`, `has_change(filter=None)`, `wait_change(filter=None)`|
|Botón|`hub.button`|`read()`, `has_change(filter=None)`, `wait_change(filter=None)`|
|LED|`hub.led`|`color(name)` o `color(r, g, b)`|
|Tareas|`hub.task`|`spawn(fn)`, `wait(seconds)`|
|Tarea (devuelta por `spawn`)|`hub.task.spawn(fn)`|`cancel()`, `join()`|

Excepciones: `WedoError`, `NotConnectedError`, `ConnectionFailedError`, `PortError`, `NoReadingError` y `TaskCancelled`.

Diferencias principales respecto a la versión Lua:

- `wedo.hub` (singleton) pasa a ser la clase `Hub`; todos los recursos cuelgan de una instancia.
- `wedo.task.now()` desaparece (se usa `time.monotonic()`).
- `task:on_cancel(fn)` desaparece (se usa `try`/`finally` dentro de la tarea).
- Los errores usan excepciones tipadas en lugar de `error()` genérico.
- Colores, rangos, validación y formato de mensajes son idénticos a la versión Lua v3; cambia solo el mecanismo (excepciones tipadas en lugar de `error()`).
- Se añade el `with` como punto de conexión (con tiempo límite), de parada segura y de espera de tareas.
- `connect()` solo inicia la conexión y regresa de inmediato; la espera, con tiempo límite, es responsabilidad de `wait_connection()`. En la versión Lua `connect()` esperaba hasta conectar.

---

## 13. Entorno y compatibilidad

La API está pensada para ejecutarse en un script o aplicación Python convencional, a diferencia de la versión Lua, que corría en un runtime web restringido.

- **Versión:** Python 3.10 o superior (por el uso de `X | None` en las anotaciones).
- **Un solo hilo de usuario por vez:** la API debe usarse desde el hilo que creó el `Hub` y desde sus tareas. Las esperas cooperativas llamadas desde otros hilos lanzan `RuntimeError`.
- **No bloquear:** `time.sleep()`, entradas bloqueantes como `input()` y operaciones largas de CPU dentro de una tarea detienen también a las demás tareas y el procesamiento de eventos del dispositivo. Para esperar se usa `hub.task.wait()`.
- **Sin `async`/`await`:** la API es síncrona en apariencia; la cooperación se expresa mediante las esperas de la sección 11, no mediante corrutinas del usuario.
- **Convivencia con `asyncio`:** usar la API dentro de un bucle de `asyncio` en ejecución no está cubierto en esta versión, porque las esperas bloquearían el bucle.
- **Hilos y procesos del usuario:** crear hilos propios que llamen a la API no está soportado; la concurrencia se hace con `hub.task`.

---

## 14. Decisiones cerradas y verificaciones pendientes

### 14.1. Decisiones cerradas en esta versión

1. **Tipos de periférico:** `"motor"`, `"distance"` y `"tilt"`.
2. **Lecturas iniciales:** `read()` lanza `NoReadingError` si no hay lectura válida; `wait_connection()` solo devuelve `True` cuando los sensores ya conectados han informado su primera lectura (sección 4.3).
3. **Rangos:** motores de `-100` a `100`; canales RGB enteros de `0` a `255`. Fuera de rango se lanza `ValueError`, sin recortar.
4. **Precisión del tilt:** `int`, en grados.
5. **Colores predefinidos del LED:** los once nombres de la sección 9.1, sin alias.
6. **Mensajes de error:** formato de la sección 3.8, idéntico al de la versión Lua.
7. **Cobertura del dispositivo:** esta versión incluye motor, distancia, inclinación, botón y LED. No se incluyen otros periféricos (por ejemplo, un zumbador/piezo) porque no hay una necesidad demostrada; si aparece, se añadiría como `hub.piezo("A")` siguiendo el criterio de la sección 15.
8. **Pérdida de conexión:** la parada de motores es de mejor esfuerzo y no se promete; las órdenes no se reenvían al reconectar (sección 4.5).
9. **Conexión:** `connect()` inicia el intento y regresa; `wait_connection(timeout)` espera; `with Hub()` espera con `connect_timeout` (10 segundos por defecto) y lanza `ConnectionFailedError` si no se conecta (secciones 4.1, 4.3 y 4.6).
10. **Validación:** tipos, rangos, filtros, puertos y colores inválidos lanzan siempre una excepción (sección 3.8).
11. **Selección del dispositivo:** `Hub()` solo recibe `connect_timeout`. La elección del dispositivo Bluetooth la gestiona el sistema o la aplicación anfitriona, y esta versión asume un único hub. Si hace falta elegir entre varios, se añadirá un parámetro a `Hub()` siguiendo el criterio de la sección 15.
12. **Cierre del intérprete:** de mejor esfuerzo, mediante `atexit` (sección 4.5).

### 14.2. Verificaciones con el dispositivo real

Estas comprobaciones no cambian la API, pero deben confirmarse antes de dar la implementación por terminada:

1. **Primera lectura:** confirmar que cada tipo de sensor informa un valor al conectarse o al enchufarse. Si alguno no lo hace, la regla de «conectado» de la sección 4.3 debe ajustarse.
2. **Pérdida de conexión:** observar qué hace el hub con los motores cuando el enlace se corta, para documentarlo.
3. **Resolución del motor:** confirmar si el dispositivo admite valores no enteros; si no, la regla de redondeo de la sección 5.1 queda como está.
4. **Tiempos de conexión:** validar con tiempos reales de búsqueda y emparejamiento el valor por defecto de `connect_timeout` (10 segundos) y los de los ejemplos.
5. **Colores:** comprobar los valores RGB orientativos de la tabla 9.1 contra el color que muestra el dispositivo.
6. **Varios hubs cercanos:** observar el comportamiento de la conexión cuando hay más de un hub disponible, para decidir si hace falta un parámetro de selección.
7. **Cierre del intérprete:** comprobar la fiabilidad del cierre con `atexit` en las plataformas objetivo.

---

## 15. Criterio para futuras extensiones

Antes de añadir una función nueva, comprobar:

1. ¿Representa una capacidad real del dispositivo o del runtime?
2. ¿Es necesaria para utilizar esa capacidad?
3. ¿Puede resolverse de forma clara con una operación que ya existe o con la biblioteca estándar?
4. ¿Añade comodidad sin ocultar el comportamiento fundamental?
5. ¿Mantiene las convenciones y el estilo de Python?
6. ¿Evita duplicar operaciones o crear abstracciones que apenas se utilizarán?

Se debe preferir la API más pequeña que permita expresar con claridad las operaciones reales. Las comodidades pueden añadirse más adelante cuando exista una necesidad concreta y demostrable.

Candidatos considerados y descartados por ahora, por poder resolverse con lo existente:

- **`hub.task.wait_until(fn)`:** cubierto por `wait_change()` para eventos y por un bucle con `wait()` para condiciones arbitrarias.
- **Parámetro `timeout` en `wait_change()`:** cubierto con una tarea auxiliar y `cancel()` (sección 11.8).
- **`task.is_done()` y consulta pública de estados:** `join()` cubre la necesidad principal de saber cuándo terminó una tarea.
- **Propiedad `hub.connected` / `is_connected()`:** cubierta por `wait_connection(0)`.
- **`on_cancel` y `now()` en tareas:** sustituidos por `try`/`finally` y `time.monotonic()` respectivamente.
- **Alias `"green"` para el LED:** ambiguo entre `light_green` y `dark_green`.
- **Periféricos adicionales (zumbador/piezo):** sin necesidad demostrada en esta versión.
- **API `async`/`await` paralela:** duplicaría toda la superficie; se reconsiderará si hay una necesidad real de integrarse con `asyncio`.