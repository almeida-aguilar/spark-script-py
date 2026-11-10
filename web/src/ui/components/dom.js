// Utilidades mínimas de DOM (sin dependencias).
export const $ = (sel, root = document) => root.querySelector(sel);

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) el.setAttribute(k, "");
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const c of children.flat()) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}

/** Habilita/deshabilita un conjunto de controles. */
export function setEnabled(els, enabled) {
  for (const el of els) el.disabled = !enabled;
}
