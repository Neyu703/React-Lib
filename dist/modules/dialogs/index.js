import { DialogFrame } from "./DialogFrame.js";
import { Modal } from "./Modal.js";
import { dialogsReducer } from "./slice.js";
/** Module form: `reducerKey` + `reducer` for `createReactLibReducers`, `components` for the UI. */
export const dialogsModule = {
    reducerKey: "dialogs",
    reducer: dialogsReducer,
    components: { Modal, DialogFrame },
};
export { DialogFrame, Modal };
export { saveDialogBox } from "./dialogBoxes.js";
export { blockNativeContextMenu } from "./nativeContextMenu.js";
export { dialogBoxesLoaded, dialogBoxesReset, dialogBoxSaved, dialogClosed, dialogLimitSet, dialogOpened, } from "./slice.js";
