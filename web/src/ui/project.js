// Exportación/importación de proyecto: el programa Python del editor como fichero .py
// (descarga directa y carga con diálogo de ficheros), al estilo «Download/Load» del editor
// de micro:bit pero sin pasar por hex: lo que se comparte es código Python.
export function exportProgram(code, filename = "mi_programa.py") {
  const blob = new Blob([code], { type: "text/x-python;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Abre el diálogo de ficheros y llama a onLoad(texto, nombreDeFichero) si elige uno. */
export function importProgram(onLoad, onError = (exc) => { throw exc; }) {
  const input = Object.assign(document.createElement("input"), { type: "file", accept: ".py,text/x-python" });
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      onLoad(await file.text(), file.name);
    } catch (exc) {
      onError(exc);
    }
  });
  input.click();
}
