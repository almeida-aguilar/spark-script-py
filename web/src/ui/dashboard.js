// Motores, sensores, LED y ejemplos. Solo presentación: toda acción pasa por `app.run`.
import { $, h, setEnabled } from "./components/dom.js";

const LED_PRESETS = [
  ["Apagado", 0, "#222"], ["Rosa", 1, "#ff6ec7"], ["Morado", 2, "#8a2be2"], ["Azul", 3, "#1e5cff"],
  ["Cian", 4, "#00d5e0"], ["Verde", 5, "#18c24a"], ["Amarillo", 6, "#ffd400"], ["Naranja", 7, "#ff8a00"],
  ["Rojo", 8, "#e5251b"], ["Blanco", 9, "#ffffff"], ["Blanco tenue", 10, "#cfcfcf"],
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
      h("strong", {}, `Motor ${port}`), h("span", { class: "dev", id: `dev-${port}` }, ""), slider, out, rev, run, stop));
    motorUi[port] = { slider, run, stop, rev };
  }
  const groupRun = h("button", { class: "primary" }, "Grupo A+B: girar");
  const groupStop = h("button", {}, "Grupo A+B: parar");
  groupRun.addEventListener("click", () => {
    const v = Number(motorUi.A.slider.value);
    app.run(`MotorGroup(A, B): ${v}`, (hub) => hub.motors(["A", "B"]).run(v));
  });
  groupStop.addEventListener("click", () => app.run("MotorGroup(A, B): parar", (hub) => hub.motors(["A", "B"]).stop()));
  motorsRoot.append(h("div", { class: "row" }, groupRun, groupStop));

  // LED
  const presets = $("#led-presets");
  for (const [name, index, color] of LED_PRESETS) {
    presets.append(h("button", {
      class: "swatch", style: `background:${color}`, title: name, "aria-label": name,
      onclick: () => { $("#led-state").textContent = `índice ${index} (${name})`; app.run(`LED: ${name}`, (hub) => hub.led.index(index)); },
    }));
  }
  $("#led-rgb").addEventListener("change", (e) => {
    const [r, g, b] = hexToRgb(e.target.value);
    $("#led-state").textContent = `RGB ${r},${g},${b}`;
    app.run(`LED: rgb(${r}, ${g}, ${b})`, (hub) => hub.led.rgb(r, g, b));
  });
  $("#led-off").addEventListener("click", () => { $("#led-state").textContent = "apagado"; app.run("LED: apagar", (hub) => hub.led.off()); });

  // Ejemplos
  $("#ex-blink").addEventListener("click", () => app.startExample("blink"));
  $("#ex-avoid").addEventListener("click", () => app.startExample("avoid"));
  $("#ex-stop").addEventListener("click", () => app.stopExample());

  // Estado habilitado/deshabilitado según conexión y puertos
  const controls = () => [
    ...Object.values(motorUi).flatMap((m) => [m.slider, m.run, m.stop, m.rev]),
    groupRun, groupStop, $("#led-rgb"), $("#led-off"), ...presets.querySelectorAll("button"),
  ];
  function renderEnabled(ports = app.hub?.ports ?? {}) {
    const on = app.connected;
    setEnabled(controls(), on);
    for (const port of ["A", "B"]) {
      const isMotor = ports[port] === "motor";
      setEnabled(Object.values(motorUi[port]), on && isMotor);
      $(`#dev-${port}`).textContent = ports[port] ? `(${ports[port]})` : "(sin dispositivo)";
    }
    const motors = ["A", "B"].filter((p) => ports[p] === "motor").length;
    setEnabled([groupRun, groupStop], on && motors === 2);
    setEnabled([$("#ex-blink"), $("#ex-avoid")], on && !running);
    $("#ex-stop").disabled = !(on && running);
  }
  let running = false;

  app.subscribe((type, d) => {
    if (type === "state") renderEnabled();
    if (type === "ports") renderEnabled(d.ports);
    if (type === "example") { running = d.running; renderEnabled(); }
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
    if (type === "ports" && app.connected) { try { setButton(app.hub.button.isPressed); } catch { /* sin conexión */ } }
  });

  let polling = false;
  setInterval(async () => {
    if (polling || !app.connected) return;
    polling = true;
    try {
      const ports = app.hub.ports;
      for (const p of ["A", "B"]) {
        try {
          if (ports[p] === "distance") { const v = await app.hub.distanceSensor(p).read(); dist.textContent = v; meter.value = v; }
          else if (ports[p] === "tilt") tilt.textContent = await app.hub.tiltSensor(p).readDirection();
        } catch (exc) {
          // OperationTimeout: el sensor no ha cambiado desde que se configuró
          if (exc.name === "OperationTimeout") (ports[p] === "distance" ? dist : tilt).textContent = "esperando cambio…";
          else if (app.connected) app._log("warn", `Sensor ${p}: ${exc.message}`);
        }
      }
    } finally { polling = false; }
  }, 300);
}
