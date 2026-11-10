---
layout: default
title: wedopy Web — arquitectura y equivalencias
description: Análisis de la implementación Python, especificación del protocolo y tabla de equivalencias con la versión JavaScript
---

# wedopy Web: arquitectura y equivalencias

Análisis del paquete Python (`wedo`, v0.2.0), del protocolo y de la tabla de equivalencias con la capa JavaScript de la aplicación.

## 1. Arquitectura (Python, paquete `wedo`)

| Capa | Archivos | Responsabilidad |
|---|---|---|
| API pública | `wedo/*.py` | `Hub`, `Motor`, sensores (`distance`, `tilt` con ejes), `LED`, `Button`, `hub.task` |
| Sesión | `web/src/api/session.js` | Crea el coordinador, sigue recursos por conexión y traduce errores públicos |
| Núcleo | `web/src/core/` | Codecs, `HubState`, `Coordinator` (escritor único, cola normal + emergencia), heartbeat y watchdog |
| Transporte | `web/src/transport/` | `WebBluetoothTransport` (BLE) y `SimulatedTransport` (simulador) |

## 2. Protocolo (verificado en `protocol/constants.py`)

- Servicios: Hub `00001523-1212-efde-1523-785feabcd123`, I/O `…4f0e…`, Batería `0x180F`.
- Características: botón `1526`, puertos `1527`, desconexión `152e`, apagado `152b`, sensores `1560`, comando de entrada `1563`, comando de salida `1565`, batería `2A19`.
- Comandos: motor `[conn 01 01 int8]`; LED índice `[06 04 01 i]`, RGB `[06 04 03 r g b]`; formato de entrada `[01 02 conn tipo modo delta(u32 LE) unidad notif]`; inicio de sensor `[00 01 conn]`.
- Notificaciones: puerto `[conn 00]` / `[conn 01 idx tipo …]`; sensor `[?, conn, valor…]`.
- Firmware (documentado en `hardware.md`): tilt de 4 posiciones, ángulo exige `UNIT_RAW` (par int8), solo notifica cambios, distancia 0..10, parada tipo `nobarrier`.

## 3. Equivalencias Python → JavaScript (v0.2.0)

| Python | JavaScript | Nota |
|---|---|---|
| `Hub()`; `with Hub() as hub` | `new Hub()`; `hub.connect()` + `await hub.waitConnection(10)` | `connect()` no bloquea; el resultado llega con `waitConnection` (`false` si se agota) |
| `hub.motor("A")` / `hub.distance("A")` / `hub.tilt("A")` | ídem, `await` en los métodos | selectores síncronos (no exigen conexión) |
| `motor.run(v)` / `stop()` | `await motor.run(v)` / `await stop()` | `TypeError`/`RangeError` por argumentos; redondeo al entero más cercano |
| `distance().read()` | `await distance().read()` | 0..10; `NoReadingError`/`js NoReadingError` si aún no hay lectura |
| `tilt.read()` / `tilt.x.read()` | `await tilt.read()` / `await tilt.x.read()` | dirección `left/right/forward/backward/none`; ejes −45..45 |
| `*.has_change(f)` / `wait_change(f)` | `hasChange(f)` / `await waitChange(f)` | consumen cambios pendientes por recurso |
| `hub.led.color(name)` / `color(r,g,b)` | ídem, `await` | once nombres canónicos; índice interno no expuesto |
| `hub.button.read()` | `hub.button.read()` | síncrono |
| `hub.task.spawn(fn)` / `wait(s)` | `hub.task.spawn(async ctx => { await ctx.wait(s) })` | `ctx.wait` lanza `TaskCancelled`; `task.join()`/`cancel()` |
| Excepciones `WedoError` y subclases | mismas clases | `TaskCancelled` (Python `BaseException`) fuera de `WedoError` |
| `WebBluetoothTransport` / simulador | ídem | mismo contrato |
| Coordinador (hilo en escritorio) | cola asíncrona con dos prioridades | |
| `Timing` | `DEFAULT_TIMING` (segundos) | valores idénticos |

## 3 bis. Editor Python (Pyodide + JSPI)

`web/src/python/wedo/` es la capa Python de la API: `_bridge.py` llama a la API JavaScript con
`pyodide.ffi.run_sync` y traduce las excepciones JS por nombre a la jerarquía Python. Las esperas
cooperativas se resuelven con marcadores (`"ok"`/`"cancelled"`/`"stopped"`) para que «Detener» no
rechace promesas (Pyodide deja continuaciones huérfanas al rechazar): `task.py` convierte el
marcador en `TaskCancelled`/`KeyboardInterrupt` dentro de la propia pila de la tarea. Cada tarea
corre en su propia pila de Python, y el paquete se sirve desde `/home/pyodide/wedo/` en el runtime.

## 4. Diferencias deliberadas

- **Selector de dispositivo**: `connect()` no limita el tiempo del selector del navegador; `connectTimeout` (15 s) cubre solo GATT y descubrimiento.
- **Operaciones GATT no cancelables**: al vencer un timeout se rechaza la promesa, pero la operación subyacente puede completarse después.
- **Órdenes antiguas**: cada petición lleva una época; las encoladas antes de una desconexión se rechazan y nunca se ejecutan tras reconectar.
- **`readBattery()`**: añadido (la lectura ya existía como heartbeat).
- El simulador emite el ángulo como par int8, como el firmware real (Python lo parchea así en `tests/conftest.py`).

## 5. Estado de los criterios de aceptación

| ID | Estado |
|---|---|
| AC-01 | Build y workflow listos; **pendiente de desplegar** |
| AC-02, AC-03 | **Pendiente de validar con hardware real** |
| AC-04 a AC-08 | Implementado y probado con simulador; hardware pendiente |
| AC-09, AC-10 | Implementado y probado (simulador); ver [limitaciones](web-seguridad.html) |
| AC-11 | Cumplido |
| AC-12 | Detección implementada; sin prueba en navegadores reales |
| AC-13 | Esta documentación |
| AC-14 | 86 pruebas (`npm test`) |
| AC-15 | Python intacto |

## 6. Riesgos abiertos

- `WebBluetoothTransport` no se ha ejecutado contra un Smart Hub; las pruebas usan un doble del navegador. Tampoco estaba validado el `BleakTransport` original (`ble.py`: «NOT validated on real hardware yet»).
- No se ha comprobado si Chrome bloquea alguna característica GATT del hub ni el comportamiento con `writeValueWithResponse` en cada plataforma.
