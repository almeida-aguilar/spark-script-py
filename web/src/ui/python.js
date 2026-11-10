// Editor Python: textarea + ejemplos + Ejecutar/Detener. La ejecución vive en python/runtime.js.
import { PythonRuntime, browserLoader } from "../python/runtime.js";
import { $, h } from "./components/dom.js";

const EXAMPLES = import.meta.glob("../python/examples/*.py", { query: "?raw", import: "default", eager: true });
const STORE_KEY = "wedopy.python.program";

export function bindPython(app, { runtime } = {}) {
  const code = $("#py-code"), out = $("#py-out"), status = $("#py-status");
  const runBtn = $("#py-run"), stopBtn = $("#py-stop"), select = $("#py-example");

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

  // Ejemplos (los de la biblioteca Python) y programa guardado
  select.append(h("option", { value: "" }, "Mi programa"));
  for (const path of Object.keys(EXAMPLES)) {
    const name = path.split("/").pop().replace(".py", "");
    select.append(h("option", { value: path }, `${name}.py`));
  }
  let saved = "";
  try { saved = localStorage.getItem(STORE_KEY) ?? ""; } catch { /* almacenamiento no disponible */ }
  code.value = saved || EXAMPLES[Object.keys(EXAMPLES).find((p) => p.endsWith("blink_and_move.py"))] || "";
  code.addEventListener("input", () => {
    select.value = "";
    try { localStorage.setItem(STORE_KEY, code.value); } catch { /* sin almacenamiento */ }
  });
  select.addEventListener("change", () => { if (select.value) code.value = EXAMPLES[select.value]; });

  // Tab inserta 4 espacios (no cambia el foco)
  code.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const { selectionStart: a, selectionEnd: b } = code;
    code.setRangeText("    ", a, b, "end");
    code.dispatchEvent(new Event("input"));
  });

  runBtn.addEventListener("click", async () => {
    out.replaceChildren();
    runBtn.disabled = true; stopBtn.disabled = false;
    try {
      await rt.init((msg) => { status.textContent = msg; });
      status.textContent = "Ejecutando…";
      const r = await rt.run(code.value);
      status.textContent = r.stopped ? "Detenido." : r.ok ? "Terminado." : "Terminó con error.";
      if (r.stopped) append("stdout", "[programa detenido]");
    } catch (exc) {
      status.textContent = "";
      append("stderr", exc.message);
    } finally {
      runBtn.disabled = false; stopBtn.disabled = true;
    }
  });
  stopBtn.addEventListener("click", () => { rt.stop(); app.hub?.tasks?.cancel?.(); });
}
