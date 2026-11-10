// @vitest-environment jsdom
// Prueba de humo de la interfaz completa con el simulador (HTML real + main.js).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s) => document.querySelector(s);

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
    for (let i = 0; i < 40 && $("#state").textContent !== "conectado"; i += 1) await sleep(100);
    expect($("#state").textContent).toBe("conectado");
    expect($("#hub-name").textContent).toBe("Hub simulado");
    expect($("#battery").textContent).toBe("87 %");
    expect($("#port-A").textContent).toBe("motor");
    expect($("#port-B").textContent).toBe("distance");
    expect($("#card-sim").hidden).toBe(false);
    expect($("#btn-disconnect").disabled).toBe(false);

    window.wedopyApp.sim.setDistance(6);
    await sleep(700);
    expect($("#dist").textContent).toBe("6");

    $("#led-presets button:nth-child(6)").click();
    document.querySelector('.motor[data-port="A"] .primary').click();
    await sleep(100);
    expect(window.wedopyApp.sim.motors[1]).toBe(0); // slider en 0 -> run(0)
    $("#btn-estop").click();
    $("#btn-disconnect").click();
    await sleep(300);
    expect($("#state").textContent).toBe("sin conexión");
    expect($("#py-code").value).toContain("from wedopy import Hub"); // editor montado con el programa inicial
    expect($("#py-export").disabled).toBe(false); // exportación de proyecto disponible
    expect(errors).toEqual([]);
  }, 15000);
});
