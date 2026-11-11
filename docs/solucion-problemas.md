---
layout: default
title: Solución de Problemas
description: Guía de diagnóstico y resolución de errores comunes de la aplicación web y WeDo 2.0
prev:
  title: Ejemplos Prácticos
  url: /ejemplos.html
---

# Solución de Problemas y Preguntas Frecuentes

Esta guía recopila las dudas, errores frecuentes y procedimientos de diagnóstico para resolver incidencias de comunicación y hardware.

---

## ❓ Errores frecuentes y soluciones

### 1. `ConnectionFailedError`: No se encuentra ningún Smart Hub

**Causa probable:** El ordenador no detecta el paquete de anuncio BLE emitido por el Smart Hub.

**Comprobaciones recomendadas:**

1. **Estado del botón y LED:** Verifica que hayas presionado el botón central del Smart Hub. El LED debe parpadear suavemente en blanco. Si no parpadea o se apaga inmediatamente, las pilas están agotadas.
2. **Conexión previa:** El Smart Hub WeDo 2.0 **solo admite un único dispositivo conectado a la vez**. Si el hub está conectado a otra aplicación (por ejemplo, Scratch Desktop o la app oficial de LEGO), ninguna otra conexión BLE podrá establecerse. Cierra esas aplicaciones o apaga y vuelve a encender el Hub.
3. **Navegador compatible:** Web Bluetooth requiere Chrome, Edge u otro navegador basado en Chromium (versión 137 o superior, por el puente síncrono de Pyodide), y la página debe servirse por **HTTPS** o `localhost`.
4. **Permisos del navegador:** Al pulsar «Conectar» debe aparecer el selector de dispositivos del navegador con `LPF2 Smart Hub 2.0` (o `3.0`). Si no aparece, revisa que el Bluetooth del sistema esté activo y concede el permiso de ubicación/Bluetooth si el sistema lo pide.

Si la conexión tarda en completarse (hub en modo emparejamiento lento), da más margen al bloque `with`:

```python
with Hub(connect_timeout=30) as hub:  # 30 segundos en lugar de 10
    ...
```

---

### 2. `NotConnectedError`: el hub no está conectado

**Causa:** Se usó un recurso (motor, sensor, LED, botón) cuando el hub no está conectado, o el enlace se perdió durante la ejecución.

**Solución:**

- Usa siempre el hub dentro del bloque `with`, o llama a `hub.connect()` y espera con `hub.wait_connection(10)` antes de operar.
- Si el enlace se perdió a mitad de programa (pilas agotadas, distancia excesiva), las esperas en curso terminan con `NotConnectedError`. Reconecta el hub y vuelve a dar las órdenes a los motores: **la API no reenvía órdenes anteriores al reconectar**.

---

### 3. `NoReadingError`: todavía no hay ninguna lectura disponible

**Causa:** El firmware del sensor WeDo 2.0 opera por **notificación ante cambios** (_delta_): solo envía datos cuando el valor cambia.

**Solución:**

- Un periférico enchufado después de la conexión puede no haber informado su primera lectura todavía. Mueve el sensor con la mano o coloca un objeto frente al sensor de distancia para provocar la primera muestra.
- Si el problema persiste, comprueba que el conector LPF2 esté firmemente encajado en el puerto.
- Tras `with Hub()` o `wait_connection()`, los sensores ya conectados han informado su primera lectura y `read()` no falla por esta razón.

---

### 4. `PortError`: puerto vacío o con un periférico de otro tipo

**Causa:** Se intentó usar un recurso sobre un puerto donde no hay periférico, o donde hay uno de otro tipo. Los mensajes identifican el recurso y el puerto, por ejemplo:

```text
puerto "a": no hay ningún periférico conectado (se esperaba "motor")
puerto "a": hay un periférico "distance" y se esperaba "motor"
```

**Diagnóstico rápido:**
Ejecuta este código para comprobar qué reconoce el hub:

```python
from wedopy import Hub

with Hub() as hub:
    print("Puertos detectados:", hub.ports())
```

- Si un puerto no aparece a pesar de tener un sensor conectado, desconecta el cable LPF2 y vuelve a conectarlo firmemente.
- Si llamaste a `hub.motor("A")`, pero el motor está en el puerto B, ajusta el puerto a `"B"`.

---

### 5. `ValueError` en motores, colores o filtros

**Causa:** La API valida todos los argumentos y no corrige en silencio. Los casos más comunes:

- `motor.run(150)` → `motor (puerto "a"): el valor 150 está fuera del rango -100..100`.
- `hub.led.color("green")` → `led: color "green" no válido (colores válidos: ...)`. Los nombres válidos son once: `off`, `pink`, `purple`, `blue`, `light_blue`, `light_green`, `dark_green`, `yellow`, `orange`, `red`, `white` (no existe el alias `"green"`).
- `hub.button.has_change("pressd")` → `button: filtro "pressd" no admitido (admitidos: "pressed", "released")`.

**Solución:** corrige el valor o consulta la referencia ([Motores](api/motores.html), [Periféricos](api/perifericos.html), [Sensores](api/sensores.html)).

---

### 6. El motor continúa girando tras cancelar una tarea

**Causa:** Cancelar una tarea (`task.cancel()`) no detiene automáticamente los motores: la limpieza se escribe de forma explícita.

**Solución:**

1. Utiliza siempre el gestor de contexto `with Hub() as hub:`, que garantiza que al salir del bloque se detendrán todos los motores.
2. Si controlas motores dentro de tareas, utiliza la estructura `try ... finally`:
   ```python
   def mover():
       motor = hub.motor("A")
       try:
           motor.run(80)
           wedopy.task.wait(2)
       finally:
           motor.stop()  # Se ejecuta incluso si la tarea es cancelada
   ```
3. Recuerda que durante la limpieza (`finally`) no puedes ceder el control (`wedopy.task.wait()` lanza de nuevo `TaskCancelled`); las operaciones directas como `motor.stop()` funcionan con normalidad.

---

## 🪟 Problemas específicos de Windows

### 1. La conexión falla en Windows

**Causas y soluciones:**

1. **Bluetooth desactivado o adaptador bloqueado.** Comprueba en _Configuración → Bluetooth y dispositivos_ que el Bluetooth está activado. En PowerShell:
   ```powershell
   Get-PnpDevice -Class Bluetooth
   ```
   Debe aparecer tu adaptador (por ejemplo, _Intel(R) Wireless Bluetooth_). Si no aparece o el Bluetooth está deshabilitado, actualiza los drivers del fabricante.
2. **Falta de emparejamiento.** Algunos adaptadores Windows no exponen dispositivos BLE no emparejados. Abre _Configuración → Bluetooth y dispositivos → Agregar dispositivo_ y empareja el "LPF2 Smart Hub" antes de ejecutar el programa.
3. **Otro cliente BLE conectado.** El hub solo admite una conexión. Cierra la app oficial de LEGO, Scratch o cualquier otra aplicación que use el hub.
4. **Adaptador incompatible o driver antiguo.** Los adaptadores Bluetooth 4.0 antiguos pueden no soportar GATT correctamente. Actualiza el driver del fabricante (Intel, Realtek, Broadcom…).

En el navegador, además: Web Bluetooth requiere Chrome, Edge u otro navegador basado en Chromium, y la página debe servirse por HTTPS (o `localhost`).

---

### 2. La conexión es lenta o intermitente en Windows

- Aleja el hub de fuentes de interferencia Wi-Fi (2.4 GHz) o USB 3.0.
- Comprueba la distancia entre el adaptador y el hub (recomendado < 5 m sin obstáculos).
- Da más margen con `Hub(connect_timeout=30)`.

---

## 🔍 Activación de Registros Detallados (Logging)

Los programas usan el módulo estándar `logging` de Python, y los mensajes aparecen en el **panel de salida Python** de la aplicación. Para ver el flujo del programa y los errores de tareas no capturadas:

```python
import logging
from wedopy import Hub

# Activar registro en nivel DEBUG
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

with Hub() as hub:
    hub.led.color("blue")
    hub.motor("A").run(50)
```

**Loggers disponibles:**

- `wedopy`: Flujo de operaciones de alto nivel y conexión.
- `wedopy` (nivel `ERROR`): si una tarea falla con una excepción no capturada, el runtime informa del error con su traceback en el panel de salida y no propaga la excepción a quien la creó.
