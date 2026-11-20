import type { PortalThemeState } from "./types.js";

/** Copies the pushed look onto the root element of a popup window. */
export function applyPortalTheme(root: HTMLElement, theme: PortalThemeState): void {
  Object.entries(theme.attributes).forEach(([name, value]) => {
    if (value === null) root.removeAttribute(name);
    else root.setAttribute(name, value);
  });
  Object.entries(theme.cssVariables).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}
