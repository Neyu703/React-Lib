/**
 * Wire format of a remembered dialog position, as the Python side stores it (one JSON object per dialog id).
 * Transported by the host's `saveDialogBox(id, box)` handler (see `configureReactLib`) and fed back with `dialogBoxesLoaded`.
 * x and y are fractions of the free space (window size minus dialog size): 0 = flush left/top, 0.5 = centred, 1 = flush right/bottom.
 */
export interface DialogBox {
  x: number;
  y: number;
  width?: string;
  height?: string;
}

/** Everything the app may send as `dialogBoxesLoaded`: dialog id -> box. */
export type DialogBoxes = Record<string, DialogBox>;
