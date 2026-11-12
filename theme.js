(() => {
  const root = document.documentElement;
  const storageKey = "farida-portfolio-theme";
  const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");
  let storedTheme = null;

  try {
    storedTheme = window.localStorage.getItem(storageKey);
  } catch (error) {
    console.warn("Could not read the saved color theme.", error);
  }

  const initialTheme = storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : systemPreference.matches ? "dark" : "light";
  root.dataset.theme = initialTheme;

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;

    let transitionTimer;
    const updateToggle = () => {
      const isDark = root.dataset.theme === "dark";
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
      toggle.title = `Switch to ${isDark ? "light" : "dark"} mode`;
    };

    toggle.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      root.classList.add("theme-transition");
      root.dataset.theme = nextTheme;
      updateToggle();

      try {
        window.localStorage.setItem(storageKey, nextTheme);
      } catch (error) {
        console.warn("Could not save the color theme preference.", error);
      }

      window.clearTimeout(transitionTimer);
      transitionTimer = window.setTimeout(() => {
        root.classList.remove("theme-transition");
      }, 650);
    });

    updateToggle();
  });
})();
