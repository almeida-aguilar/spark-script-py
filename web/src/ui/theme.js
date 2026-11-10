// Selector de tema (luna/sol). Cicla auto → claro → oscuro y guarda la elección en el
// navegador. «Auto» sigue prefers-color-scheme (los estilos lo hacen con una media query);
// los modos manuales fijan data-theme en <html>, que manda sobre la media query.
const KEY = "wedopy.theme";
const MODES = ["auto", "light", "dark"];
const ICONS = { auto: "🌗", light: "☀️", dark: "🌙" };
const LABELS = { auto: "Tema del sistema (auto)", light: "Tema claro", dark: "Tema oscuro (Dracula)" };
const THEME_COLORS = { light: "#f4f5fa", dark: "#282a36" };

export function bindThemeButton(button) {
  let mode;
  try { mode = localStorage.getItem(KEY); } catch { /* sin almacenamiento */ }
  if (!MODES.includes(mode)) mode = "auto";

  const apply = () => {
    if (mode === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", mode);
    button.textContent = ICONS[mode];
    button.setAttribute("aria-label", LABELS[mode]);
    button.title = LABELS[mode];
    // La barra de color del navegador (meta theme-color): en manual fuerza el color del tema;
    // en auto recupera los valores por esquema declarados en index.html.
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      meta.content = mode === "auto"
        ? (meta.media.includes("light") ? THEME_COLORS.light : THEME_COLORS.dark)
        : THEME_COLORS[mode === "light" ? "light" : "dark"];
    }
  };

  button.addEventListener("click", () => {
    mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
    try { localStorage.setItem(KEY, mode); } catch { /* sin almacenamiento */ }
    apply();
  });

  apply();
}
