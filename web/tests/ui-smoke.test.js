// @vitest-environment jsdom
// Prueba de humo de la interfaz completa con el simulador (HTML real + main.js).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s) => document.querySelector(s);

/** Espera a que el texto del elemento sea `text` (los eventos llegan en ticks distintos). */
async function waitText(sel, text, timeoutMs = 5000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end && $(sel).textContent !== text) await sleep(50);
  return $(sel).textContent;
}

describe("interfaz + simulador", () => {
  it("arranca, conecta al simulador y refleja puertos, batería y sensores", async () => {
    const html = readFileSync("index.html", "utf8");
    document.body.innerHTML = html.match(/<body>([\s\S]*)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/g, "");
    const errors = [];
    window.addEventListener("error", (e) => errors.push(e.message));
    await import("../src/main.js");

    // sin navigator.bluetooth (jsdom): banner y simulador preseleccionado
    expect($("#compat").hidden).toBe(false);
    expect($("#transport").value).toBe("simulated");

    $("#btn-connect").click();
    expect(await waitText("#state", "conectado")).toBe("conectado");
    expect(await waitText("#hub-name", "Hub simulado")).toBe("Hub simulado");
    expect(await waitText("#battery", "87 %")).toBe("87 %");
    expect(await waitText("#port-A", "motor")).toBe("motor");
    expect(await waitText("#port-B", "distance")).toBe("distance");
    expect($("#card-sim").hidden).toBe(false);
    expect($("#btn-disconnect").disabled).toBe(false);

    window.wedopyApp.sim.setDistance(6);
    expect(await waitText("#dist", "6")).toBe("6");

    $("#led-presets button:nth-child(6)").click();
    document.querySelector('.motor[data-port="A"] .primary').click();
    await sleep(100);
    expect(window.wedopyApp.sim.motors[1]).toBe(0); // slider en 0 -> run(0)
    $("#btn-estop").click();
    $("#btn-disconnect").click();
    await sleep(300);
    expect($("#state").textContent).toBe("sin conexión");
    expect($("#py-code").value).toContain("from wedo import Hub"); // editor montado con el programa inicial
    expect($("#py-export").disabled).toBe(false); // exportación de proyecto disponible
    expect(errors).toEqual([]);
  }, 15000);
});
