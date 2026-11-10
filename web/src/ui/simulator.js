// Panel del simulador: permite controlar sensores, botón, dispositivos y fallos.
import { $ } from "./components/dom.js";

export function bindSimulator(app) {
  const sim = () => app.sim;

  for (const port of ["A", "B"]) {
    const sel = $(`#sim-${port}`);
    sel.value = app.simDevices[port] ?? "";
    sel.addEventListener("change", () => {
      const kind = sel.value;
      if (kind) app.simDevices[port] = kind; else delete app.simDevices[port];
      if (!sim() || !app.connected) return;
      if (kind) sim().attach(port, kind); else sim().detach(port);
      app._log("info", `Simulador: puerto ${port} → ${kind || "vacío"}`);
    });
  }
  $("#sim-dist").addEventListener("input", (e) => {
    app.simDistance = Number(e.target.value);
    sim()?.setDistance(app.simDistance);
  });
  $("#sim-tilt").addEventListener("change", (e) => sim()?.setTiltDirection(e.target.value));

  const press = $("#sim-press");
  const down = () => sim()?.press();
  const up = () => sim()?.release();
  press.addEventListener("pointerdown", down);
  press.addEventListener("pointerup", up);
  press.addEventListener("pointerleave", up);

  $("#sim-drop").addEventListener("click", () => {
    app._log("warn", "Simulador: pérdida de enlace inyectada.");
    sim()?.dropLink();
  });
  $("#sim-freeze").addEventListener("change", (e) => {
    if (e.target.checked) sim()?.freeze(); else sim()?.unfreeze();
    app._log("warn", `Simulador: hub ${e.target.checked ? "sin responder (sin ACK)" : "responde de nuevo"}.`);
  });
}
