---
layout: default
title: wedopy Web — arquitectura y equivalencias
description: Análisis de la implementación Python, especificación del protocolo y tabla de equivalencias con la versión JavaScript
---

# wedopy Web: arquitectura y equivalencias

Entregable de la Fase 1 del plan de migración, derivado de la lectura completa del repositorio (`wedopy_core/_wedopy.pyx`, `protocol/`, `transport/`, `src/wedopy/*` y `tests/`).

## 1. Arquitectura actual (Python)

| Capa | Archivos | Responsabilidad |
|---|---|---|
| API pública | `src/wedopy/*` | `Hub`, `Motor`, `MotorGroup`, sensores, `LED`, `Button`, tareas, `running_time` |
| Sesión | `session.py` | Crea el coordinador, cancela tareas antes de parar motores, registra el supervisor |
| Núcleo | `_wedopy.pyx` | Codecs, `HubState`, `Coordinator` (escritor único, cola normal + emergencia), heartbeat y watchdog |
| Transporte | `transport/ble.py`, `simulated.py` | `BleakTransport` (hilo con bucle asyncio) y `SimulatedHub` |

## 2. Protocolo (verificado en `protocol/constants.py`)

- Servicios: Hub `00001523-1212-efde-1523-785feabcd123`, I/O `…4f0e…`, Batería `0x180F`.
- Características: botón `1526`, puertos `1527`, desconexión `152e`, apagado `152b`, sensores `1560`, comando de entrada `1563`, comando de salida `1565`, batería `2A19`.
- Comandos: motor `[conn 01 01 int8]`; LED índice `[06 04 01 i]`, RGB `[06 04 03 r g b]`; formato de entrada `[01 02 conn tipo modo delta(u32 LE) unidad notif]`; inicio de sensor `[00 01 conn]`.
- Notificaciones: puerto `[conn 00]` / `[conn 01 idx tipo …]`; sensor `[?, conn, valor…]`.
- Firmware (documentado en `hardware.md`): tilt de 4 posiciones, ángulo exige `UNIT_RAW` (par int8), solo notifica cambios, distancia 0..10, parada tipo `nobarrier`.

## 3. Equivalencias Python → JavaScript

| Python | JavaScript | Nota |
|---|---|---|
| `Hub()`; `with Hub() as hub` | `new Hub()`; `Hub.use(async hub => …)` | `connect()` debe lanzarse desde un clic |
| `hub.motor("A")`, `hub.motors(("A","B"))` | `hub.motor("A")`, `hub.motors(["A","B"])` | síncronos (leen la tabla de puertos) |
| `motor.run(v)` / `stop()` | `await motor.run(v)` / `await stop()` | `TypeError`/`RangeError` por argumentos |
| `distance_sensor().read()`, `is_near` | `await distanceSensor().read()`, `isNear` | redondeo half-to-even idéntico a `round()` |
| `tilt_sensor().read_angle()` / `read_direction()` | `readAngle()` → `[x, y]` / `readDirection()` | |
| `hub.led.rgb/index/on/off` + alias en español | igual, `await` | constantes `LED.ROJO`, `GREEN`… |
| `hub.button.is_pressed` | `hub.button.isPressed` | síncrono |
| `hub.tasks.add/wait/cancel`, `yield task.sleep(s)` | `tasks.add(async ctx => { await ctx.sleep(s) })` | `ctx.cancelAll()` dentro de tareas; `wait({signal})` sustituye a Ctrl+C |
| `running_time()` | `runningTime()` | ms |
| Excepciones `WedoError` y subclases | mismas clases | |
| `BleakTransport` / `SimulatedHub` | `WebBluetoothTransport` / `SimulatedTransport` | mismo contrato |
| Hilo coordinador | cola asíncrona con dos prioridades | |
| `Timing` | `DEFAULT_TIMING` (segundos) | valores idénticos |

## 3 bis. Editor Python (Pyodide + JSPI)

`web/src/python/wedopy/` es una capa Python de la API: `task.py`, `tasks.py`, `time.py`, `exceptions.py` y las constantes de `led.py` son **copias literales** de la biblioteca; `hub.py`, `motor.py`, `sensors.py`, `button.py` y `_bridge.py` llaman a la API JavaScript con `pyodide.ffi.run_sync`. Las excepciones JS se traducen por nombre a la jerarquía Python.

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
| AC-14 | 82 pruebas (`npm test`) |
| AC-15 | Python intacto |

## 6. Riesgos abiertos

- `WebBluetoothTransport` no se ha ejecutado contra un Smart Hub; las pruebas usan un doble del navegador. Tampoco estaba validado el `BleakTransport` original (`ble.py`: «NOT validated on real hardware yet»).
- No se ha comprobado si Chrome bloquea alguna característica GATT del hub ni el comportamiento con `writeValueWithResponse` en cada plataforma.
