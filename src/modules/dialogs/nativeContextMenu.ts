/** The browser's own right-click menu (reload, save, view source ...) has no place in the app; the app's own menus still open. */
export function blockNativeContextMenu(doc: Document): void {
  doc.addEventListener("contextmenu", (event) => event.preventDefault());
}
