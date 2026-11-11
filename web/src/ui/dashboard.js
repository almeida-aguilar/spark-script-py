// Motores, sensores y LED. Solo presentación: toda acción pasa por `app.run`.
// API v0.3.0: sin grupo de motores (dos llamadas explícitas), `led.color(nombre|rgb)`,
// selectores por puerto que no exigen conexión.
import { $, h, setEnabled } from "./components/dom.js";

// Colores predefinidos del LED (los del firmware real, comprobados en hardware). Las
// etiquetas van en español; el nombre que se envía a la API, en inglés.
const LED_PRESETS = [
  ["Apagado", "off", "#1a1a1a"], ["Rosa", "pink", "#ff6ec7"], ["Morado", "purple", "#8a2be2"],
  ["Azul", "blue", "#1e5cff"], ["Azul claro", "light_blue", "#00d5e0"], ["Verde claro", "light_green", "#00b894"],
  ["Verde oscuro", "dark_green", "#0a7d34"], ["Amarillo", "yellow", "#ffd400"], ["Naranja", "orange", "#ff8a00"],
  ["Rojo", "red", "#e5251b"], ["Blanco", "white", "#ffffff"],
];

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

export function bindDashboard(app) {
  const motorsRoot = $("#motors");
  const motorUi = {};
  for (const port of ["A", "B"]) {
    const slider = h("input", { type: "range", min: -100, max: 100, step: 1, value: 0, "aria-label": `Velocidad motor ${port}` });
    const out = h("output", {}, "0");
    const run = h("button", { class: "primary" }, "Girar");
    const stop = h("button", {}, "Parar");
    const rev = h("button", { title: "Invertir dirección" }, "⇄");
    slider.addEventListener("input", () => { out.textContent = slider.value; });
    run.addEventListener("click", () => app.run(`Motor ${port}: ${slider.value}`, (hub) => hub.motor(port).run(Number(slider.value))));
    stop.addEventListener("click", () => { slider.value = 0; out.textContent = "0"; app.run(`Motor ${port}: parar`, (hub) => hub.motor(port).stop()); });
    rev.addEventListener("click", () => { slider.value = -slider.value; out.textContent = slider.value; });
    motorsRoot.append(h("div", { class: "motor", "data-port": port },
      h("div", { class: "motor-head" },
        h("strong", {}, `Motor ${port}`), h("span", { class: "dev", id: `dev-${port}` }, "")),
      slider, out, rev, run, stop));
    motorUi[port] = { slider, run, stop, rev };
  }
  // Sin grupo de motores en la API: se actuationa cada motor con una llamada explícita.
  const bothRun = h("button", { class: "primary" }, "A+B: girar");
  const bothStop = h("button", {}, "A+B: parar");
  bothRun.addEventListener("click", () => {
    const v = Number(motorUi.A.slider.value);
    app.run(`Motores A y B: ${v}`, async (hub) => { await hub.motor("A").run(v); await hub.motor("B").run(v); });
  });
  bothStop.addEventListener("click", () => app.run("Motores A y B: parar", async (hub) => { await hub.motor("A").stop(); await hub.motor("B").stop(); }));
  motorsRoot.append(h("div", { class: "row" }, bothRun, bothStop));

  // LED
  const presets = $("#led-presets");
  for (const [label, name, color] of LED_PRESETS) {
    presets.append(h("button", {
      class: "swatch", style: `background:${color}`, title: label, "aria-label": label,
      onclick: () => { $("#led-state").textContent = label; app.run(`LED: ${label}`, (hub) => hub.led.color(name)); },
    }));
  }
  $("#led-rgb").addEventListener("change", (e) => {
    const [r, g, b] = hexToRgb(e.target.value);
    $("#led-state").textContent = `RGB ${r},${g},${b}`;
    app.run(`LED: rgb(${r}, ${g}, ${b})`, (hub) => hub.led.color(r, g, b));
  });
  $("#led-off").addEventListener("click", () => { $("#led-state").textContent = "apagado"; app.run("LED: apagar", (hub) => hub.led.color(0, 0, 0)); });

  // Estado habilitado/deshabilitado según conexión y puertos
  const controls = () => [
    ...Object.values(motorUi).flatMap((m) => [m.slider, m.run, m.stop, m.rev]),
    bothRun, bothStop, $("#led-rgb"), $("#led-off"), ...presets.querySelectorAll("button"),
  ];
  function renderEnabled(ports = currentPorts()) {
    const on = app.connected;
    setEnabled(controls(), on);
    for (const port of ["A", "B"]) {
      const isMotor = ports[port.toLowerCase()] === "motor";
      setEnabled(Object.values(motorUi[port]), on && isMotor);
      const kind = ports[port.toLowerCase()];
      $(`#dev-${port}`).textContent = kind ? `(${kind})` : "(sin dispositivo)";
    }
    const motors = ["A", "B"].filter((p) => ports[p.toLowerCase()] === "motor").length;
    setEnabled([bothRun, bothStop], on && motors === 2);
  }

  /** Puertos del hub: `ports()` es un método en la API v0.3.0. */
  function currentPorts() {
    try { return app.connected ? app.hub.ports() : {}; } catch { return {}; }
  }

  app.subscribe((type, d) => {
    if (type === "state") renderEnabled();
    if (type === "ports") renderEnabled(d.ports);
    if (type === "motor") {
      const port = d.conn === 1 ? "A" : d.conn === 2 ? "B" : null;
      if (port && d.speed === 0 && Number(motorUi[port].slider.value) !== 0) { /* el control conserva el último valor elegido */ }
    }
  });
  renderEnabled();

  // Sensores y botón
  const dist = $("#dist"), meter = $("#dist-meter"), tilt = $("#tilt"), btn = $("#button");
  const setButton = (p) => { btn.textContent = p ? "pulsado" : "suelto"; btn.className = `badge ${p ? "st-connected" : ""}`; };
  app.subscribe((type, d) => {
    if (type === "button") setButton(d.pressed);
    if (type === "state" && !app.connected) { dist.textContent = tilt.textContent = btn.textContent = "—"; meter.value = 0; }
    if (type === "ports" && app.connected) { try { setButton(app.hub.button.read()); } catch { /* sin conexión */ } }
  });

  let polling = false;
  setInterval(async () => {
    // Mientras hay un programa Python en marcha, el panel no sondea los sensores: el
    // inclinómetro solo admite un formato a la vez y el sondeo reconfiguraría el sensor
    // mientras el programa lee su ángulo (dirección vs. ángulo).
    if (polling || !app.connected || app.python?.running) return;
    polling = true;
    try {
      const ports = currentPorts();
      for (const p of ["A", "B"]) {
        try {
          if (ports[p.toLowerCase()] === "distance") { const v = await app.hub.distance(p).read(); dist.textContent = v; meter.value = v; }
          else if (ports[p.toLowerCase()] === "tilt") tilt.textContent = await app.hub.tilt(p).read();
        } catch (exc) {
          // El sensor todavía no ha informado su primera lectura
          if (exc.name === "NoReadingError") (ports[p.toLowerCase()] === "distance" ? dist : tilt).textContent = "sin lectura aún…";
          else if (app.connected) app._log("warn", `Sensor ${p}: ${exc.message}`);
        }
      }
    } finally { polling = false; }
  }, 300);
}
