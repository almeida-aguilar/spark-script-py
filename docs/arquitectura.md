---
layout: default
title: Arquitectura y Seguridad
description: Diseño interno de wedopy-web, coordinador de un solo escritor, watchdog y gestión de fallos
prev:
  title: Excepciones
  url: /api/excepciones.html
next:
  title: Ejemplos Prácticos
  url: /ejemplos.html
---

# Arquitectura y Seguridad

La arquitectura de **wedopy-web** está diseñada para proporcionar una experiencia de programación sencilla y educativa sin comprometer la fiabilidad y seguridad física del hardware.

---

## 🏛️ Las 4 Capas del Sistema

```
┌────────────────────────────────────────────────────────┐
│ 1. Capa de Usuario (Python, en Pyodide)                │
│    Tus programas en el panel Python del editor         │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ 2. API de los programas (paquete wedopy, en Pyodide)   │
│    Hub · Motor · Sensors · LED · Button · Tasks        │
│    Validación de tipos, rangos y context managers      │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ 3. Núcleo (JavaScript, en la página)                   │
│    • Coordinador Single-Writer (Cola Normal y Urgente) │
│    • Máquina de Estados (DISCONNECTED, READY, ERROR)   │
│    • Watchdog y Heartbeat en el bucle de eventos       │
│    • Serialización y decodificación binaria de paquetes│
│    • Capa de Transporte (Web Bluetooth / Simulado)     │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ 4. Hardware Físico                                     │
│    LEGO WeDo 2.0 Smart Hub (BLE GATT)                  │
└────────────────────────────────────────────────────────┘
```

El programa Python corre dentro de la página (Pyodide) y llama al núcleo JavaScript a través de un puente síncrono (JSPI): las esperas cooperativas bloquean el programa Python sin congelar la página, de modo que la interfaz sigue respondiendo mientras los motores y las tareas avanzan.

---

## 🧵 El Coordinador de un Solo Escritor (*Single-Writer*)

Las pilas Bluetooth (y en particular el firmware del chip BLE del Smart Hub WeDo 2.0) sufren de corrupción de estado o pérdida de paquetes si múltiples operaciones de escritura GATT se envían concurrentemente o sin esperar la respuesta previa.

Para resolver esto de raíz:
1. **Un único escritor**: todas las órdenes que salen hacia el hardware pasan por una cola coordinada central; nunca hay dos escrituras GATT en vuelo a la vez.
2. **Escrituras con respuesta (*with response*)**: nunca se recurre a escrituras ciegas sin confirmación (*write-without-response*). Cada comando debe recibir un acuse de recibo del microcontrolador antes de despachar el siguiente.
3. **Canal de emergencia**: el coordinador dispone de dos colas de prioridad:
   - **Cola normal**: lecturas periódicas de sensores, cambios de color del LED y ajustes de velocidad de motores.
   - **Cola de emergencia**: solicitudes de parada crítica del watchdog, que adelantan a cualquier operación pendiente de la cola normal.

---

## ⏱️ Sistema de Seguridad: Heartbeat y Watchdog

Uno de los riesgos principales en robótica educativa es que un vehículo o mecanismo motorizado continúe en movimiento descontrolado si la página se bloquea o se pierde la señal de radio.

```
       [ Motor en marcha ]
               │
               ▼
┌─────────────────────────────┐
│    Heartbeat (cada 0.5 s)   │
│  Lee nivel de Batería (GATT)│
└──────────────┬──────────────┘
               │
               ├── ¿ACK recibido en < 2.0 s? ──► Continúa normal
               │
               └── ¿Sin respuesta > 2.0 s?
                       │
                       ▼
         ┌───────────────────────────┐
         │     WATCHDOG DISPARADO    │
         │  1. Parada de emergencia  │
         │     (2 intentos inmediatos)│
         │  2. Hub pasa a 'ERROR'    │
         │  3. Log en el panel       │
         └───────────────────────────┘
```

### Funcionamiento detallado:

- **Activación automática**: en cuanto cualquier motor del hub adquiere una velocidad distinta de cero, la supervisión activa el *heartbeat*.
- **Latido (Heartbeat)**: solicita la lectura de la característica de batería cada **0.5 segundos**.
- **Perro guardián (Watchdog)**: si no se recibe una confirmación válida en **2.0 segundos**, el watchdog toma el control:
  1. Emite una orden de parada de emergencia con prioridad máxima (hasta 2 intentos).
  2. Registra el evento crítico en los registros del panel (consola/`log`).
  3. Transiciona el estado del hub a `ERROR` para evitar nuevas escrituras que puedan comprometer el sistema.
- **Independencia del programa**: el watchdog vive en el núcleo JavaScript de la página, fuera del programa Python. Si tu programa entra en un bucle infinito `while True: pass` sin puntos de espera cooperativa, o el planificador de tareas se suspende, **el watchdog continuará activo y protegerá el hardware**.

---

## 🎛️ Parámetros de Tiempos (*Timing*)

El núcleo utiliza parámetros de temporización definidos en `src/core/timing.js`:

| Parámetro | Valor por defecto | Descripción |
| :--- | :---: | :--- |
| `connectTimeout` | `15.0 s` | Conexión GATT + descubrimiento de puertos (sin contar el selector del navegador). |
| `opTimeout` | `1.0 s` | Tiempo límite para recibir acuse de recibo de una orden individual. |
| `emergencyAttempts` | `2` | Número máximo de reintentos para órdenes de parada de emergencia. |
| `emergencyAttemptTimeout` | `0.5 s` | Espera por intento de parada de emergencia. |
| `heartbeatInterval` | `0.5 s` | Intervalo entre latidos de supervisión. |
| `watchdogTimeout` | `2.0 s` | Umbral de pérdida de enlace antes del paro de emergencia. |
| `sensorTimeout` | `1.0 s` | Espera del primer valor tras configurar un sensor. |
| `settleQuiet` / `settleMax` | `1.5 s` / `5.0 s` | Estabilización del descubrimiento de puertos al conectar. |
