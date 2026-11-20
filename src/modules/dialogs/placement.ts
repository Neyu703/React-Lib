export function moveTo(dialog: HTMLDialogElement, left: number, top: number): void {
  const rect = dialog.getBoundingClientRect();
  const x = Math.min(Math.max(left, 0), Math.max(0, window.innerWidth - rect.width));
  const y = Math.min(Math.max(top, 0), Math.max(0, window.innerHeight - rect.height));
  dialog.style.left = `${x}px`;
  dialog.style.top = `${y}px`;
  dialog.style.maxWidth = `${window.innerWidth - x}px`;
  dialog.style.maxHeight = `${window.innerHeight - y}px`;
}

const clampFraction = (value: number): number =>
  Math.round(Math.min(Math.max(value, 0), 1) * 10000) / 10000;

/** Takes the dialog's current place as the wanted one, relative to the free space of the window. */
export function remember(dialog: HTMLDialogElement): void {
  const rect = dialog.getBoundingClientRect();
  const freeWidth = window.innerWidth - rect.width;
  const freeHeight = window.innerHeight - rect.height;
  dialog.dataset.wantedX = String(freeWidth > 1 ? clampFraction(rect.left / freeWidth) : 0.5);
  dialog.dataset.wantedY = String(freeHeight > 1 ? clampFraction(rect.top / freeHeight) : 0.5);
}

export const wanted = (dialog: HTMLDialogElement): { x: number; y: number } => ({
  x: Number(dialog.dataset.wantedX),
  y: Number(dialog.dataset.wantedY),
});

/** Puts the dialog where the wanted fractions say, for the current window size. */
export function place(dialog: HTMLDialogElement): void {
  dialog.style.maxWidth = `${window.innerWidth}px`;
  dialog.style.maxHeight = `${window.innerHeight}px`;
  const rect = dialog.getBoundingClientRect();
  const target = wanted(dialog);
  moveTo(
    dialog,
    target.x * Math.max(0, window.innerWidth - rect.width),
    target.y * Math.max(0, window.innerHeight - rect.height),
  );
}
