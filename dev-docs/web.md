---
layout: default
title: wedopy Web
description: Controla el WeDo 2.0 desde el navegador con Web Bluetooth
---

# wedopy Web

Aplicación: [`/wedopy/`](../) (Chrome o Edge, HTTPS). Sin hardware, elige **Simulador**.

Capa JS v0.3.0 — espejo del paquete Python `wedopy`:

```javascript
import { Hub } from "./src/index.js";

const hub = new Hub();
hub.connect();                        // inicia la conexión y regresa de inmediato
if (await hub.waitConnection(10)) {   // `false` si se agota el tiempo
  const motor = hub.motor("A");
  await motor.run(50);                // -100..100; redondea al entero más cercano
  await wedopy.task.wait(1);
  await motor.stop();
}
```

Tareas cooperativas:

```javascript
const blink = wedopy.task.spawn(async (ctx) => {
  for (;;) {
    hub.led.color("yellow"); await ctx.wait(0.4);
    hub.led.color("white");  await ctx.wait(0.4);
  }
});
const move = wedopy.task.spawn(async (ctx) => {
  try {
    await hub.motor("A").run(40);
    await ctx.wait(2);
  } finally {
    await hub.motor("A").stop();
  }
});
await move.join();
blink.cancel();
```

- `ctx.wait(s)` es el punto cooperativo de la tarea: se resuelve con marcadores (`"ok"`/`"cancelled"`/`"stopped"`) y lanza `TaskCancelled` cuando el programa se detiene o la tarea se cancela (cancelación persistente).
- `task.spawn(fn)` devuelve un `Task` con `join()` y `cancel()`.
- «Detener» en la UI llama `task.interruptAll()`: todas las esperas se interrumpen y los `finally` se ejecutan.
- El hub de la UI es compartido: los programas Python no lo desconectan al salir (`with Hub()` detiene motores y tareas, pero el enlace lo cierra el panel con «Desconectar»).

Más: [arquitectura y equivalencias](web-migracion.html) · [seguridad](web-seguridad.html).

## Editor

El editor de Python de la app usa resaltado estilo Dracula y carga los mismos ejemplos del paquete
`wedo` (`web/src/python/examples/`). Solo ejecuta un script a la vez: cada «▶ Ejecutar» interrumpe el
programa anterior (parada de motores incluida) y arranca el nuevo. El proyecto se **exporta** como
fichero `.py` (botón «⬇ Exportar») y se recupera con «⬆ Importar».

## Desarrollo

```bash
cd web && npm ci && npm run dev    # WEDOPY_BASE=/ para servir en la raíz
npm test
```
