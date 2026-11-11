---
layout: default
title: Seguridad en el navegador
description: Mecanismos de seguridad de wedo Web y sus limitaciones
---

# Seguridad en el navegador

## Mecanismos conservados

| Mecanismo | Valor | Origen |
|---|---|---|
| Heartbeat (lectura de batería, solo con motores activos) | 0,5 s | `Timing.heartbeat_interval` |
| Watchdog: sin ACK válido | 2 s | `watchdog_timeout` |
| Timeout de operación | 1 s | `op_timeout` |
| Intentos de parada de emergencia | 2 (0,5 s cada uno) | `emergency_attempts` |
| Perfil de parada | `nobarrier` | `Coordinator.STOP_PROFILE` |

Escrituras siempre con respuesta, un solo escritor, cola de emergencia prioritaria, `disconnect()` que cancela tareas y luego para motores, y rechazo de órdenes antiguas tras reconectar. Los controles se deshabilitan y se muestra un aviso en estado `error`.

## Limitaciones propias del navegador

- **El watchdog JavaScript no garantiza la parada.** Una pestaña oculta puede recibir temporizadores retrasados (≥ 1 s, y hasta 1 min con *intensive throttling*), y el sistema operativo puede suspender la pestaña. Un watchdog tardío es una parada tardía.
- **Mitigación parcial**: la interfaz envía una parada al ocultarse la pestaña con motores en marcha y al `pagehide` (mejor esfuerzo; el navegador puede no dejar completarla).
- **Mantén la pestaña visible** mientras haya motores en marcha.
- Un ACK confirma la comunicación, no que el eje se haya detenido.
- No hay constancia documentada de que el hub detenga sus motores por sí solo si pierde el enlace: **no debe asumirse**. Debe verificarse con hardware real.
- Web Bluetooth exige HTTPS y un gesto del usuario; no hay reconexión automática.

## Editor Python

- «Detener» es cooperativo: surte efecto en la siguiente llamada al hub o a `sleep`. Un bucle Python puro sin esas llamadas bloquea la pestaña y no puede detenerse desde la página.
- Al terminar o fallar un programa se ordena parar todos los motores (equivalente al supervisor de la biblioteca de escritorio).
