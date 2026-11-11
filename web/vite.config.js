// La base solo se aplica al build (GitHub Pages). En desarrollo (`npm run dev`) se sirve en
// la raíz: http://localhost:5173/. En el build se usan rutas relativas ("./") para que el
// resultado funcione igual en https://…github.io/spark-script-py/ y en cualquier otra ubicación
// (por si el repo cambia de nombre); SPARK_BASE permite forzar otra ruta.
export default ({ command }) => ({
  base: process.env.SPARK_BASE ?? (command === "build" ? "./" : "/"),
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    // Pyodide necesita JSPI para run_sync; Node 22 lo expone con este flag, Node >= 24 lo trae activo.
    pool: "forks",
    poolOptions: {
      forks: {
        execArgv: Number(process.versions.node.split(".")[0]) < 24 ? ["--experimental-wasm-jspi"] : [],
      },
    },
    testTimeout: 30000,
  },
});
