// Panel de conexión: transporte, conectar/desconectar, estado, batería y puertos.
import { webBluetoothProblem } from "../index.js";
import { $, setEnabled } from "./components/dom.js";

export function bindConnection(app) {
  const els = {
    transport: $("#transport"), connect: $("#btn-connect"), disconnect: $("#btn-disconnect"),
    state: $("#state"), name: $("#hub-name"), battery: $("#battery"), estop: $("#btn-estop"),
    compat: $("#compat"), unsafe: $("#unsafe"),
  };

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
    els.state.textContent = state;
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
      for (const p of ["A", "B"]) $(`#port-${p}`).textContent = d.ports[p] ?? "—";
    }
  });
  render();
  setInterval(() => app.refreshBattery(), 30000);
}
