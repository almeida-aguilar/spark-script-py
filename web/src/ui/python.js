// Editor Python: resaltado con tema según el navegador + Ejecutar/Detener + exportar/importar
// .py + salida. La ejecución vive en python/runtime.js: solo puede haber un script en marcha;
// al lanzar uno nuevo, el anterior se interrumpe.
import { PythonRuntime, browserLoader } from "../python/runtime.js";
import { createPythonEditor } from "./editor.js";
import { askFileName, exportProgram, importProgram, sanitizeFileName } from "./project.js";
import { $, h } from "./components/dom.js";

const STORE_KEY = "wedopy.python.program";
const NAME_KEY = "wedopy.python.fileName";
const FONT_KEY = "wedopy.python.fontSize";
const EXPORT_NAME = "mi_programa.py";

// Tamaño del texto del código: el que haya pedido el usuario con «−A»/«A+» y, si no,
// el que toque por pantalla (13.5px en escritorio, 12px en móvil; ver style.css).
const FONT_MIN = 10;
const FONT_MAX = 18;
const FONT_STEP = 1;

/** Botones «−A»/«A+»: ajustan el tamaño del texto del editor y lo recuerdan. */
function bindFontSize(host) {
  const down = $("#btn-font-down");
  const up = $("#btn-font-up");
  if (!down || !up) return;
  const current = () => parseFloat(getComputedStyle(host).getPropertyValue("--py-fs")) || 13.5;
  const refresh = () => {
    const size = current();
    down.disabled = size <= FONT_MIN;
    up.disabled = size >= FONT_MAX;
    const label = `Tamaño del texto del código: ${size} px`;
    down.title = `${label} (reducir)`;
    up.title = `${label} (aumentar)`;
  };
  const apply = (size) => {
    const clamped = Math.min(FONT_MAX, Math.max(FONT_MIN, size));
    host.style.setProperty("--py-fs", `${clamped}px`);
    try { localStorage.setItem(FONT_KEY, String(clamped)); } catch { /* sin almacenamiento */ }
    refresh();
  };
  let saved = null;
  try { saved = parseFloat(localStorage.getItem(FONT_KEY)); } catch { /* sin almacenamiento */ }
  if (Number.isFinite(saved)) {
    // Solo si el usuario eligió un tamaño se fija el valor; si no, manda el de la pantalla.
    host.style.setProperty("--py-fs", `${saved}px`);
  }
  refresh();
  down.addEventListener("click", () => apply(current() - FONT_STEP));
  up.addEventListener("click", () => apply(current() + FONT_STEP));
}

// Programa inicial (parpadeo + marcha con tareas cooperativas, como el ejemplo de la biblioteca).
const DEFAULT_PROGRAM = `"""Blink the LED while a motor runs, using cooperative tasks (no threads, no asyncio)."""
from wedo import Hub

with Hub() as hub:
    motor = hub.motor("A")

    def blink():
        for _ in range(10):
            hub.led.color("yellow")
            hub.task.wait(0.3)
            hub.led.color("white")
            hub.task.wait(0.3)

    def move():
        try:                      # cancelling a task never stops the motor by itself
            motor.run(75)
            hub.task.wait(3)
        finally:
            motor.stop()

    hub.task.spawn(blink)
    hub.task.spawn(move)
    # On leaving the block, the runtime waits for every task to finish.
`;

export function bindPython(app, { runtime } = {}) {
  const out = $("#py-out"), status = $("#py-status");
  const runBtn = $("#py-run"), stopBtn = $("#py-stop");

  const save = (text) => { try { localStorage.setItem(STORE_KEY, text); } catch { /* sin almacenamiento */ } };

  const editor = createPythonEditor({ host: $("#py-editor"), onChange: (v) => save(v) });
  bindFontSize($("#py-editor"));

  const append = (stream, text) => {
    out.append(h("span", { class: stream === "stderr" ? "err" : "" }, text.endsWith("\n") ? text : `${text}\n`));
    out.scrollTop = out.scrollHeight;
  };

  const rt = runtime ?? new PythonRuntime({
    getHub: () => app.hub,
    onOutput: append,
    ...browserLoader(),
  });
  app.python = rt;

  // Programa guardado (o el inicial)
  let saved = "";
  try { saved = localStorage.getItem(STORE_KEY) ?? ""; } catch { /* almacenamiento no disponible */ }
  editor.setValue(saved || DEFAULT_PROGRAM);

  // Proyecto: exportar/importar .py
  // El nombre del fichero se pregunta al exportar (y se recuerda entre sesiones y al
  // importar otro programa, para no perder el nombre original).
  let fileName = EXPORT_NAME;
  try { fileName = localStorage.getItem(NAME_KEY) || EXPORT_NAME; } catch { /* sin almacenamiento */ }
  $("#py-export").addEventListener("click", async () => {
    const chosen = await askFileName(fileName);
    if (!chosen) { status.textContent = "Exportación cancelada."; return; }
    fileName = chosen;
    try { localStorage.setItem(NAME_KEY, chosen); } catch { /* sin almacenamiento */ }
    exportProgram(editor.getValue(), chosen);
    status.textContent = `Programa exportado como ${chosen}`;
  });
  $("#py-import").addEventListener("click", () => {
    importProgram((text, filename) => {
      editor.setValue(text);
      save(text);
      fileName = sanitizeFileName(filename);
      try { localStorage.setItem(NAME_KEY, fileName); } catch { /* sin almacenamiento */ }
      status.textContent = `Importado «${filename}» — listo para ejecutar.`;
    }, (exc) => {
      status.textContent = "";
      append("stderr", `Importación: ${exc.message}\n`);
    });
  });

  // Ejecutar: si hay otro programa en marcha, rt.run lo interrumpe y lo espera antes de arrancar.
  let runSeq = 0;
  runBtn.addEventListener("click", () => {
    const seq = ++runSeq;
    const wasRunning = rt.running;
    out.replaceChildren();
    stopBtn.disabled = false;
    if (wasRunning) append("stderr", "⏹ se interrumpe el programa anterior…\n");
    status.textContent = wasRunning ? "Interrumpiendo el programa anterior…" : "Ejecutando…";
    rt.run(editor.getValue()).then((r) => {
      if (seq !== runSeq) return; // hay una ejecución más reciente
      status.textContent = r.stopped ? "Detenido." : r.ok ? "Terminado." : "Terminó con error.";
      stopBtn.disabled = true;
      if (r.stopped) append("stdout", "[programa detenido]");
    }).catch((exc) => {
      if (seq !== runSeq) return;
      status.textContent = "";
      append("stderr", exc.message);
      stopBtn.disabled = true;
    });
  });
  stopBtn.addEventListener("click", () => { rt.stop(); });

  // Ctrl/Cmd+Intro ejecuta (como el botón ▶)
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || !(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    runBtn.click();
  });
}
