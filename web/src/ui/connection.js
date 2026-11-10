// Panel de conexión: transporte, conectar/desconectar, estado, batería y puertos.
// El panel del hub vive en un cajón oculto por defecto (⚙ Hub) que se abre al conectar.
import { webBluetoothProblem } from "../index.js";
import { $, setEnabled } from "./components/dom.js";

export function bindConnection(app) {
  const els = {
    transport: $("#transport"), connect: $("#btn-connect"), disconnect: $("#btn-disconnect"),
    state: $("#state"), name: $("#hub-name"), battery: $("#battery"), estop: $("#btn-estop"),
    compat: $("#compat"), unsafe: $("#unsafe"),
  };
  const hubBtn = $("#btn-hub"), drawer = $("#hub-drawer"), hubClose = $("#hub-close");

  const setOpen = (open) => {
    drawer.hidden = !open;
    hubBtn.setAttribute("aria-expanded", String(open));
  };
  setOpen(false);
  hubBtn.addEventListener("click", () => setOpen(drawer.hidden));
  hubClose.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !drawer.hidden) setOpen(false);
  });

  // El cajón queda justo debajo de la barra superior: se mide su altura real (y su
  // reflow al envolverse) con un ResizeObserver, no se supone una altura fija.
  // (Si el navegador no lo soporta, queda anclado arriba como hasta ahora.)
  const header = document.querySelector(".wb-top");
  if (header && typeof ResizeObserver === "function") {
    const syncTop = () => drawer.style.setProperty("--wb-top-h", `${header.offsetHeight}px`);
    syncTop();
    new ResizeObserver(syncTop).observe(header);
  }

  // Detección de compatibilidad: nunca se asume Web Bluetooth.
  const problem = webBluetoothProblem();
  if (problem) {
    els.compat.hidden = false;
    els.compat.textContent = `${problem} Puedes probar la aplicación con el simulador.`;
    els.transport.querySelector('option[value="web-bluetooth"]').disabled = true;
    els.transport.value = "simulated";
  }

  const busy = (b) => setEnabled([els.connect, els.transport], !b);

  els.connect.addEventListener("click", async () => {
    busy(true);
    setOpen(true); // muestra el estado de la conexión con el hub
    els.connect.textContent = "Conectando…";
    try {
      // connect() se invoca directamente desde el clic: Web Bluetooth exige un gesto del usuario.
      await app.connect(els.transport.value, { acceptAll: $("#accept-all").checked });
    } catch { /* ya registrado en la consola */ } finally {
      els.connect.textContent = app.unsafe ? "Reconectar" : "Conectar";
      busy(false);
      render();
    }
  });
  els.disconnect.addEventListener("click", () => app.disconnect());
  els.estop.addEventListener("click", () => app.emergencyStop());

  function render() {
    const { state } = app;
    // El badge se lee en la barra superior: en la interfaz todo va en español.
    const STATE_LABELS = {
      disconnected: "sin conexión",
      connecting: "conectando",
      connected: "conectado",
      disconnecting: "desconectando",
      error: "error",
    };
    els.state.textContent = STATE_LABELS[state] ?? state;
    els.state.className = `badge st-${state}`;
    const connected = app.connected;
    els.disconnect.disabled = !(connected || app.unsafe);
    els.estop.disabled = !connected;
    els.transport.disabled = connected;
    els.connect.disabled = connected || state === "connecting";
    els.connect.textContent = app.unsafe ? "Reconectar" : "Conectar";
    els.unsafe.hidden = !app.unsafe;
    if (app.unsafe) {
      els.unsafe.textContent = "Estado inseguro: se perdió el enlace con el hub o el watchdog detectó que no respondía. "
        + "Los controles están deshabilitados. Comprueba que los motores estén parados y reconecta.";
    }
    document.querySelector("#card-sim").hidden = app.kind !== "simulated";
    if (!connected) { els.battery.textContent = "—"; if (!app.unsafe) els.name.textContent = "—"; }
  }

  app.subscribe((type, d) => {
    if (type === "state") render();
    if (type === "battery") els.battery.textContent = `${d.percent} %`;
    if (type === "hubname") els.name.textContent = d.name;
    if (type === "ports") {
      for (const p of ["A", "B"]) $(`#port-${p}`).textContent = d.ports[p.toLowerCase()] ?? "—";
    }
  });
  render();
  setInterval(() => app.refreshBattery(), 30000);
}
