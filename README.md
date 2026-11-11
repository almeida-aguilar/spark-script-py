# wedopy Web

Controla el **LEGO® WeDo 2.0 Smart Hub** desde el navegador con **Web Bluetooth**, sin instalar
nada: una página con **simulador** integrado y un **editor de Python** al estilo del editor de
micro:bit (tema **Dracula**) que ejecuta tus programas sobre el hub real o simulado.

> Requiere Chrome o Edge ≥ 137 y HTTPS (Web Bluetooth no funciona en HTTP ni en otros
> navegadores). Sin hardware a mano, elige **Simulador** en el panel de conexión.

## Qué incluye

- **Módulos**: motores, LED, botón, teclado y sensores (`tilt`, `distance`) con la API Python
  `wedopy` que ejecuta la propia aplicación (v0.3.0): `hub.motor("A").run(50)`,
  `hub.led.color("dark_green")`, `wedopy.key("space").read()`, …
- **Tareas cooperativas**: `wedopy.task.spawn(async (ctx) => { … })` con `ctx.wait`, una sola hebra;
  `task.join()` espera a que termine una tarea y «⏹ Detener» interrumpe todas.
- **Seguridad**: watchdog, parada de emergencia, tiempo esperable y estado de máquina en el
  core (`docs/web-seguridad.md`); al terminar un programa no se dejan motores girando.
- **Editor de Python**: resaltado propio con paleta Dracula, ejecución de un script a la vez
  (cada «▶ Ejecutar» interrumpe el anterior), botón «⏹ Detener» (como Ctrl+C, con
  `finally`/limpieza respetado), salida de `print` y consola de eventos por separado, y
  exportación/importación del proyecto como fichero `.py`.
- **Temas**: claro/oscuro automático según el navegador, con botón 🌗 que cicla
  auto → claro → oscuro (se recuerda en `localStorage`).
- **Panel «⚙ Hub»**: consola de eventos y tramas del hub, oculto por defecto; se abre solo al
  conectar y se puede cerrar con «✕» o `Esc`.

## El editor de Python, por dentro

Los programas se escriben con la API Python `wedopy` (`from wedopy import Hub`) que trae la aplicación y corren sobre
**Pyodide** (CPython 3.14 compilado a WASM) dentro de la propia página:

- El puente `wedopy._bridge` usa la integración **JSPI** (`pyodide.ffi.run_sync`) para que el
  código escrito de forma síncrona (`wedopy.task.wait`, `m.run(…)` con retardo) no congele la página.
- «Detener» no mata hilos: las esperas se resuelven con un marcador de interrupción y el paquete
  lanza `TaskCancelled`/`KeyboardInterrupt` dentro de la tarea, de modo que los `finally` del
  programa se ejecutan igual.
- La conexión del hub es del panel de la aplicación, no del programa: `with Hub()` detiene
  motores y tareas al salir, pero no desconecta (eso lo hace «Desconectar» del panel).

```python
import wedopy
from wedopy import Hub

with Hub() as hub:
    def mover():
        m = hub.motor("A")
        try:
            m.run(40)
            for _ in range(4):
                wedopy.task.wait(0.5)
        finally:
            m.stop()
            print("limpieza")

    wedopy.task.spawn(mover)
```

## Desarrollo

```bash
cd web
npm ci
npm run dev       # WEDOPY_BASE=/ para servir en la raíz
```

Otros comandos:

```bash
npm test          # suite vitest (92 pruebas), copia Pyodide primero (scripts/copy-pyodide.mjs)
npm run build     # genera ../dist/ listo para publicar
npm run preview
```

`npm run dev/build/test` copian automáticamente los ficheros de Pyodide a `web/public/pyodide/`
con `scripts/copy-pyodide.mjs`, así que no hay pasos extra a mano.

### Estructura

```
web/
  index.html            # página del editor + panel de conexión
  src/
    api/                # Hub y dispositivos (motor, led, button, sensors, tasks, session)
    core/               # protocolo, coordinador, watchdog, state-machine, timing (reconect/Ctrl+C)
    transport/          # web-bluetooth (BLE) y simulated (simulador local)
    ui/                 # editor, highlight, consola, dashboard, tema, conexión, simulador, proyecto
    python/             # runtime Pyodide (runtime.js) + paquete Python wedopy/*.py
  tests/                # vitest: protocolo, estado, tareas, sensores, BLE, UI, editor Python
  scripts/              # copy-pyodide.mjs
docs/                   # documentación de usuario (Jekyll → se publica en /wedopy-web/docs/)
dev-docs/               # documentación de desarrollo (no se publica)
```

## Documentación

**Usuario** — se publica en [`docs/`](docs/) (Jekyll) y llega desde el enlace «Documentación»
de la app:

- [Introducción](docs/index.md) · [Instalación](docs/instalacion.md) · [Guía rápida](docs/guia-rapida.md)
- [Hardware WeDo 2.0](docs/hardware.md) · [Ejemplos prácticos](docs/ejemplos.md)
- [Referencia de la API](docs/api/index.md) — hub, motores, sensores, periféricos, tareas, excepciones
- [Arquitectura y seguridad](docs/arquitectura.md) · [Solución de problemas](docs/solucion-problemas.md)

**Desarrollo** — en [`dev-docs/`](dev-docs/), solo en el repositorio:

- [`dev-docs/web.md`](dev-docs/web.md) — guía de la aplicación y del editor.
- [`dev-docs/web-migracion.md`](dev-docs/web-migracion.md) — arquitectura y equivalencias con la biblioteca.
- [`dev-docs/web-seguridad.md`](dev-docs/web-seguridad.md) — seguridad: watchdog, parada de emergencia
  y límites propios del navegador.

## Licencia

MIT — el autor del proyecto añadirá el fichero `LICENSE` correspondiente.
