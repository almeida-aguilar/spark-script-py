// Consola de eventos, operaciones y errores. Solo presentación.
import { $, h } from "./components/dom.js";

const MAX_LINES = 300;

export function createConsole(root = $("#console")) {
  function log(level, message) {
    const time = new Date().toLocaleTimeString();
    const li = h("li", { class: `lvl-${level}` }, h("time", {}, time), " ", message);
    root.append(li);
    while (root.children.length > MAX_LINES) root.firstChild.remove();
    root.scrollTop = root.scrollHeight; // desplaza solo la consola, no la página
  }
  $("#console-clear").addEventListener("click", () => { root.replaceChildren(); });
  return { log };
}
