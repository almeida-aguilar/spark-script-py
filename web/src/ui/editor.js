// Editor con resaltado y numeración de líneas sin dependencias: un textarea casi invisible
// (texto transparente) sobre un <pre> coloreado, ambos con la misma tipografía, más un canal
// de líneas sincronizado por desplazamiento. Suficiente para programas cortos y educativos.
import { highlightPython } from "./highlight.js";
import { h } from "./components/dom.js";

const MONO = `13.5px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`;

export function createPythonEditor({ host, onChange = () => {} }) {
  const gutter = h("div", { class: "py-gutter", "aria-hidden": "true" });
  const surface = h("div", { class: "py-surface" });
  const hl = h("pre", { class: "py-hl", "aria-hidden": "true" });
  const ta = h("textarea", {
    id: "py-code", class: "py-input", wrap: "off", spellcheck: "false", autocapitalize: "off",
    autocorrect: "off", "aria-label": "Código Python",
  });
  surface.append(hl, ta);
  host.classList.add("py-editor");
  host.append(gutter, surface);

  /** Pinta el resaltado, la numeración y alinea el canal. */
  function render() {
    const code = ta.value;
    hl.innerHTML = highlightPython(code) + (code.endsWith("\n") ? "" : "\n");
    const lines = code.split("\n").length;
    let nums = "";
    for (let i = 1; i <= lines; i += 1) nums += `<span>${i}</span>`;
    gutter.innerHTML = nums;
    gutter.scrollTop = ta.scrollTop;
  }

  /** Sincroniza el desplazamiento con el canal y el <pre> coloreado. */
  function syncScroll() {
    hl.scrollTop = ta.scrollTop;
    hl.scrollLeft = ta.scrollLeft;
    gutter.scrollTop = ta.scrollTop;
  }

  ta.addEventListener("input", () => { render(); onChange(ta.value); });
  ta.addEventListener("scroll", syncScroll);

  // Intro de tabulación: 4 espacios sin perder el foco; Ctrl/Cmd+Intro lo captura el módulo de ejecución.
  ta.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const { selectionStart: a, selectionEnd: b } = ta;
    ta.setRangeText("    ", a, b, "end");
    ta.dispatchEvent(new Event("input"));
  });

  render();

  return {
    textarea: ta,
    setValue(value) { ta.value = value; render(); },
    getValue() { return ta.value; },
    focus() { ta.focus(); },
  };
}
