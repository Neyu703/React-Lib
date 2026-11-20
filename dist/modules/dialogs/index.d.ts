import { DialogFrame } from "./DialogFrame.js";
import { Modal } from "./Modal.js";
/** Module form: `reducerKey` + `reducer` for `createReactLibReducers`, `components` for the UI. */
export declare const dialogsModule: {
    readonly reducerKey: "dialogs";
    readonly reducer: import("@reduxjs/toolkit").Reducer<import("./slice.js").DialogsState>;
    readonly components: {
        readonly Modal: typeof Modal;
        readonly DialogFrame: typeof DialogFrame;
    };
};
export { DialogFrame, Modal };
export { saveDialogBox } from "./dialogBoxes.js";
export { blockNativeContextMenu } from "./nativeContextMenu.js";
export { dialogBoxesLoaded, dialogBoxesReset, dialogBoxSaved, dialogClosed, dialogLimitSet, dialogOpened, type DialogsState, } from "./slice.js";
export type { DialogBox, DialogBoxes } from "./types.js";
