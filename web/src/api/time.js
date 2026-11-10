const START = performance.now();

/** Milisegundos desde que se cargó el módulo (el inicio del programa, en la práctica). */
export function runningTime() {
  return Math.trunc(performance.now() - START);
}
