# wedopy Web

Controla el **LEGO® WeDo 2.0 Smart Hub** desde el navegador con **Web Bluetooth**, sin instalar
nada: una página con **simulador** integrado y un **editor de Python** al estilo del editor de
micro:bit (tema **Dracula**) que ejecuta tus programas sobre el hub real o simulado.

> Requiere Chrome o Edge ≥ 137 y HTTPS (Web Bluetooth no funciona en HTTP ni en otros
> navegadores). Sin hardware a mano, elige **Simulador** en el panel de conexión.

## Qué incluye

- **Módulos**: motores, LED, botón y sensores (`tilt`, `distance`) con la misma API que la
  biblioteca `wedopy` de escritorio: `hub.motor("A").run(50)`, `hub.led.index(5)`, …
- **Tareas cooperativas**: `hub.tasks.add(async (ctx) => { … })` con `ctx.sleep`, orden
  determinista y una sola hebra; `hub.tasks.wait()` espera a que terminen todas.
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

Los programas se escriben con la biblioteca Python (`from wedopy import Hub`) y corren sobre
**Pyodide** (CPython 3.14 compilado a WASM) dentro de la propia página:

- El puente `wedopy._bridge` usa la integración **JSPI** (`pyodide.ffi.run_sync`) para que el
  código escrito de forma síncrona (`time.sleep`, `m.run(…)` con retardo) no congele la página.
- «Detener» no mata hilos: levanta una bandera en el `runtime` JS; los `sleep`
  despiertan antes de tiempo y la siguiente llamada al puente lanza
  `KeyboardInterrupt`, de modo que los `finally` del programa se ejecutan igual.
- Los mismos ficheros `.py` del proyecto sirven tanto para la biblioteca de escritorio
  como para el editor (`web/src/python/wedopy/`).

```python
from wedopy import Hub, task

hub = Hub()

def mover():
    m = hub.motor("A")
    try:
        m.run(40)
        for _ in range(10):
            yield task.sleep(0.5)
    finally:
        m.stop()
        print("limpieza")

hub.tasks.add(mover)
hub.tasks.wait()
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
    api/                # Hub y dispositivos (motor, led, button, sensors, tasks, session, time)
    core/               # protocolo, coordinador, watchdog, state-machine, timing (reconect/Ctrl+C)
    transport/          # web-bluetooth (BLE) y simulated (simulador local)
    ui/                 # editor, highlight, consola, dashboard, tema, conexión, simulador, proyecto
    python/             # runtime Pyodide (runtime.js) + paquete Python wedopy/*.py
  tests/                # vitest: protocolo, estado, tareas, sensores, BLE, UI, editor Python
  scripts/              # copy-pyodide.mjs
docs/                   # documentación (web.md, web-migracion.md, web-seguridad.md)
```

## Documentación

- [`docs/web.md`](docs/web.md) — guía de la aplicación y del editor.
- [`docs/web-migracion.md`](docs/web-migracion.md) — arquitectura y equivalencias con la biblioteca.
- [`docs/web-seguridad.md`](docs/web-seguridad.md) — seguridad: watchdog, parada de emergencia
  y límites propios del navegador.

## Licencia

MIT — el autor del proyecto añadirá el fichero `LICENSE` correspondiente.
