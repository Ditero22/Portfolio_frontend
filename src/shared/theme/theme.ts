type Theme = "dark" | "light";
const key = "portfolio_theme";
const eventName = "portfolio-theme-change";
const systemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(key);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.dispatchEvent(new Event(eventName));
}

export function initializeTheme() {
  applyTheme(storedTheme() ?? systemTheme());
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (!storedTheme()) applyTheme(systemTheme());
    });
  window.addEventListener("storage", (event) => {
    if (event.key === key || event.key === null)
      applyTheme(storedTheme() ?? systemTheme());
  });
}

export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(key, theme);
  } catch {
    /* Theme still works without persistence. */
  }
  applyTheme(theme);
}

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function subscribeTheme(callback: () => void) {
  window.addEventListener(eventName, callback);
  return () => window.removeEventListener(eventName, callback);
}
