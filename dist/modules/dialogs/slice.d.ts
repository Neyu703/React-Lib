import type { DialogBox } from "./types.js";
export interface DialogsState {
    /** Open non-exempt dialogs, oldest first; the "max open dialogs" limit evicts from the front. */
    openIds: string[];
    limit: number;
    /** Remembered position and size of the floating dialogs, by dialog id. */
    boxes: Record<string, DialogBox>;
    /** Counts "forget all boxes" requests, so floating dialogs can put themselves back in the middle. */
    boxesReset: number;
}
export declare const dialogOpened: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    id: string;
}, "dialogs/dialogOpened">, dialogClosed: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    id: string;
}, "dialogs/dialogClosed">, dialogLimitSet: import("@reduxjs/toolkit").ActionCreatorWithPayload<string | number, "dialogs/dialogLimitSet">, dialogBoxesLoaded: import("@reduxjs/toolkit").ActionCreatorWithPayload<Record<string, DialogBox>, "dialogs/dialogBoxesLoaded">, dialogBoxSaved: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    id: string;
    box: DialogBox;
}, "dialogs/dialogBoxSaved">, dialogBoxesReset: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"dialogs/dialogBoxesReset">;
export declare const dialogsReducer: import("@reduxjs/toolkit").Reducer<DialogsState>;
