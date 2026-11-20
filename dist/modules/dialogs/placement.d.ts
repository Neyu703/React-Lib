export declare function moveTo(dialog: HTMLDialogElement, left: number, top: number): void;
/** Takes the dialog's current place as the wanted one, relative to the free space of the window. */
export declare function remember(dialog: HTMLDialogElement): void;
export declare const wanted: (dialog: HTMLDialogElement) => {
    x: number;
    y: number;
};
/** Puts the dialog where the wanted fractions say, for the current window size. */
export declare function place(dialog: HTMLDialogElement): void;
