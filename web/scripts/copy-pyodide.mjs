// Copia el runtime de Pyodide (npm) a public/pyodide/ para servirlo desde el propio sitio:
// sin CDN, funciona sin conexión a terceros y la versión queda fijada por package-lock.json.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "node_modules", "pyodide");
const to = join(root, "public", "pyodide");
mkdirSync(to, { recursive: true });
for (const f of ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"]) {
  copyFileSync(join(from, f), join(to, f));
}
console.log(`Pyodide copiado a ${to}`);
