// Resaltado de Python estilo Dracula, sin dependencias. Tokenizador por expresiones regulares,
// suficiente para programas educativos: lo raro (f-strings complejos, líneas críticas) simplemente
// se queda sin color, nunca se rompe.
const esc = (s) => s.replace(/[&<>]/g, (c) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"));

const KEYWORDS = new Set([
  "and", "as", "assert", "async", "await", "break", "class", "continue", "def", "del", "elif",
  "else", "except", "finally", "for", "from", "global", "if", "import", "in", "is", "lambda",
  "nonlocal", "not", "or", "pass", "raise", "return", "try", "while", "with", "yield", "match", "case",
]);
const CONSTANTS = new Set(["True", "False", "None", "self", "cls"]);
const BUILTINS = new Set([
  "print", "len", "range", "input", "open", "str", "int", "float", "bool", "bytes", "list", "dict",
  "set", "tuple", "frozenset", "abs", "min", "max", "round", "sum", "sorted", "reversed", "enumerate",
  "zip", "map", "filter", "any", "all", "isinstance", "issubclass", "type", "object", "super", "dir",
  "repr", "hash", "hex", "oct", "bin", "ord", "chr", "divmod", "pow", "format", "id", "getattr",
  "setattr", "hasattr", "callable", "iter", "next", "Exception", "KeyboardInterrupt", "ValueError",
  "TypeError", "RuntimeError", "IndexError", "KeyError", "AttributeError", "OSError", "StopIteration",
  "ZeroDivisionError", "TimeoutError",
]);

// Orden de alternancia: comentario > cadena (triples antes de simples) > decorador > número > identificador.
const TOKEN_RE = /(?<cmt>#.*)|(?<str>"""[\s\S]*?"""|'''[\s\S]*?'''|(?:[fFrRbBuU]{0,2})"(?:\\[\s\S]|[^"\\\n])*"|(?:[fFrRbBuU]{0,2})'(?:\\[\s\S]|[^'\\\n])*')|(?<dec>@[\w.]+)|(?<num>\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?j?|\.\d+(?:[eE][+-]?\d+)?)\b)|(?<id>[^\W\d]\w*)|(?<ws>[ \t]+)|(?<any>[\s\S])/g;

/** Devuelve HTML coloreado (todo escapado) para el código Python dado. */
export function highlightPython(src) {
  TOKEN_RE.lastIndex = 0;
  let html = "";
  let pos = 0;
  let m;
  while ((m = TOKEN_RE.exec(src))) {
    if (m.index > pos) html += esc(src.slice(pos, m.index));
    pos = m.index + m[0].length;
    const g = m.groups;
    let cls = null;
    let text = m[0];
    if (g.cmt) { cls = "cmt"; }
    else if (g.str) { cls = "str"; }
    else if (g.dec) { cls = "dec"; }
    else if (g.num) { cls = "num"; }
    else if (g.id) {
      const word = g.id;
      text = word;
      if (KEYWORDS.has(word)) cls = "kw";
      else if (CONSTANTS.has(word)) cls = "kw2";
      else if (BUILTINS.has(word)) cls = "builtin";
      else {
        // Nombre de función: identificador seguido de «(» en la misma línea.
        let j = Math.min(src.length, m.index + word.length);
        while (j < src.length && (src[j] === " " || src[j] === "\t")) j += 1;
        if (src[j] === "(") cls = "fn";
      }
    }
    html += cls ? `<span class="${cls}">${esc(text)}</span>` : esc(text);
    if (m[0].length === 0) TOKEN_RE.lastIndex += 1; // salvaguarda: nunca bucle infinito
  }
  if (pos < src.length) html += esc(src.slice(pos));
  return html;
}
