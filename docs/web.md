---
layout: default
title: wedopy Web
description: Controla el WeDo 2.0 desde el navegador con Web Bluetooth
---

# wedopy Web

Aplicación: [`/wedopy/`](../) (Chrome o Edge, HTTPS). Sin hardware, elige **Simulador**.

```javascript
import { Hub } from "./src/index.js";

await Hub.use(async (hub) => {
  const motor = hub.motor("A");
  await motor.run(50);
  await new Promise((r) => setTimeout(r, 1000));
  await motor.stop();
});
```

Tareas cooperativas:

```javascript
hub.tasks.add(async (ctx) => { for (;;) { await hub.led.index(5); await ctx.sleep(0.4); await hub.led.off(); await ctx.sleep(0.4); } }, { background: true });
hub.tasks.add(async (ctx) => { await hub.motor("A").run(40); await ctx.sleep(2); await hub.motor("A").stop(); });
await hub.tasks.wait();
```

Más: [arquitectura y equivalencias](web-migracion.html) · [seguridad](web-seguridad.html).

## Desarrollo

```bash
cd web && npm ci && npm run dev    # WEDOPY_BASE=/ para servir en la raíz
npm test
```
