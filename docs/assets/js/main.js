document.addEventListener("DOMContentLoaded", () => {
  // Alternancia de tema: auto -> light -> dark (guardado en localStorage, sin recargar).
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    const LABEL = { auto: "Tema: automático", light: "Tema: claro", dark: "Tema: oscuro" };
    const ICON = { auto: "🌗", light: "☀️", dark: "🌙" };
    const current = () => localStorage.getItem("wedo.docs.theme") || "auto";
    const systemTheme = () => (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

    const apply = (mode) => {
      const resolved = mode === "auto" ? systemTheme() : mode;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved; // scrollbars y controles nativos
    };

    const refresh = () => {
      themeBtn.textContent = ICON[current()];
      themeBtn.title = `${LABEL[current()]} (clic para cambiar)`;
    };

    themeBtn.addEventListener("click", () => {
      const order = ["auto", "light", "dark"];
      const next = order[(order.indexOf(current()) + 1) % order.length];
      localStorage.setItem("wedo.docs.theme", next);
      apply(next);
      refresh();
    });
    refresh();

    matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
      if (current() !== "auto") return;
      apply("auto");
    });
  }

  // Mobile sidebar toggle
  const toggleBtn = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".site-sidebar");
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (sidebar.classList.contains("open") && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove("open");
      }
    });
  }

  // Active link detection
  const currentPath = window.location.pathname;
  const sidebarLinks = document.querySelectorAll(".sidebar-links a");
  sidebarLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && (currentPath.endsWith(href) || currentPath.endsWith(href + "/") || (href !== "/" && currentPath.includes(href)))) {
      link.classList.add("active");
    }
  });

  // Code copy buttons and language headers
  document.querySelectorAll("pre").forEach((pre) => {
    // Avoid double wrapping if already inside code-container
    if (pre.parentElement && pre.parentElement.classList.contains("code-container")) {
      return;
    }

    const container = document.createElement("div");
    container.className = "code-container";
    pre.parentNode.insertBefore(container, pre);

    // Detect language from class
    let lang = "";
    const code = pre.querySelector("code");
    const testClasses = (pre.className + " " + (code ? code.className : "") + " " + (pre.closest(".highlighter-rouge") ? pre.closest(".highlighter-rouge").className : ""));
    const match = testClasses.match(/language-(\w+)/);
    if (match) {
      lang = match[1];
    }

    const header = document.createElement("div");
    header.className = "code-header";

    const langSpan = document.createElement("span");
    langSpan.className = "code-lang";
    langSpan.textContent = lang ? lang.toUpperCase() : "CÓDIGO";
    header.appendChild(langSpan);

    const button = document.createElement("button");
    button.className = "copy-button";
    button.textContent = "Copiar";
    button.setAttribute("aria-label", "Copiar código al portapapeles");
    header.appendChild(button);

    container.appendChild(header);
    container.appendChild(pre);

    button.addEventListener("click", async () => {
      const textToCopy = code ? code.innerText : pre.innerText;
      try {
        await navigator.clipboard.writeText(textToCopy);
        button.textContent = "¡Copiado!";
        setTimeout(() => {
          button.textContent = "Copiar";
        }, 2000);
      } catch (err) {
        console.error("Error al copiar:", err);
      }
    });
  });

  // Sidebar filter
  const searchInput = document.querySelector("#sidebar-filter");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      sidebarLinks.forEach((link) => {
        const text = link.textContent.toLowerCase();
        const li = link.closest("li");
        if (!li) return;
        if (!query || text.includes(query)) {
          li.style.display = "";
        } else {
          li.style.display = "none";
        }
      });
    });
  }
});
