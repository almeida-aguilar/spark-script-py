// La ruta base "/wedopy/" solo se aplica al build (GitHub Pages). En desarrollo (`npm run dev`)
// se sirve en la raíz: http://localhost:5173/. WEDOPY_BASE permite forzar otra ruta.
export default ({ command }) => ({
  base: process.env.WEDOPY_BASE ?? (command === "build" ? "/wedopy/" : "/"),
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    // Pyodide necesita JSPI para run_sync; Node 22 lo expone con este flag (Node 24 lo trae activo).
    pool: "forks",
    poolOptions: { forks: { execArgv: ["--experimental-wasm-jspi"] } },
    testTimeout: 30000,
  },
});
