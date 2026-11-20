/**
 * jsdom has no pointer capture and no show/showModal/close for <dialog>; installs stand-ins
 * (`show`/`showModal` set the `open` attribute, `showModal` also sets `data-modal="true"`).
 */
export function installDomStubs(): void {
  Element.prototype.setPointerCapture = () => undefined;
  Element.prototype.releasePointerCapture = () => undefined;
  Element.prototype.hasPointerCapture = () => false;
  HTMLDialogElement.prototype.show = function show() {
    this.setAttribute("open", "");
    delete this.dataset.modal;
  };
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
    this.dataset.modal = "true";
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
}
