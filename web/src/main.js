import "./style.css";
import { App } from "./app.js";
import { bindConnection } from "./ui/connection.js";
import { createConsole } from "./ui/console.js";
import { bindDashboard } from "./ui/dashboard.js";
import { bindPython } from "./ui/python.js";
import { bindSimulator } from "./ui/simulator.js";
import { bindThemeButton } from "./ui/theme.js";
import { $ } from "./ui/components/dom.js";

const app = new App();
const con = createConsole();
app.subscribe((type, d) => { if (type === "log") con.log(d.level, d.message); });

bindConnection(app);
bindDashboard(app);
bindSimulator(app);
bindPython(app);
bindThemeButton($("#btn-theme"));

// Seguridad: los temporizadores de una pestaña oculta pueden retrasarse.
document.addEventListener("visibilitychange", () => { if (document.hidden) app.onHidden(); });

con.log("info", app.supportsBluetooth
  ? "Web Bluetooth disponible. Pulsa «Conectar» y elige tu Smart Hub."
  : "Web Bluetooth no disponible en este navegador: usa el simulador.");

// Diagnóstico: contexto seguro, API disponible y adaptador Bluetooth.
con.log("debug", `Diagnóstico: isSecureContext=${window.isSecureContext}, navigator.bluetooth=${Boolean(navigator.bluetooth)}, `
  + `origen=${location.origin}`);
navigator.bluetooth?.getAvailability?.()
  .then((ok) => con.log(ok ? "info" : "warn", ok ? "Adaptador Bluetooth disponible." : "El navegador no ve ningún adaptador Bluetooth (¿servicio bluetooth apagado?)."))
  .catch(() => {});

window.wedopyApp = app; // depuración desde la consola del navegador
