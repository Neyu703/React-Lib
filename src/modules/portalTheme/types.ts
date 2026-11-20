/**
 * What the app pushes (action `portalThemeSet`) so that dialogs in a popup window look like the app: the app decides the values, the lib only applies them.
 * Plain JSON, so a Python settings endpoint can deliver it unchanged.
 */
export interface PortalThemeState {
  /** "float" or "window"; anything else is a fixed, centred modal. */
  dialogMode: string;
  /** Attributes for the popup's <html> element, e.g. `data-theme`; null removes the attribute. */
  attributes: Record<string, string | null>;
  /** CSS custom properties for the popup's <html> element, e.g. `--accent`. */
  cssVariables: Record<string, string>;
}
