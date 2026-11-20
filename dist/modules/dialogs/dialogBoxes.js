import { wanted } from "./placement.js";
import { dialogBoxSaved } from "./slice.js";
import { reactLibHandlers } from "../../core/host.js";
import { selectReactLib } from "../../core/hooks.js";
/** Remembers the position and size of a floating dialog in the state and tells the host to keep it. */
export function saveDialogBox(store, id, dialog) {
    if (!dialog.open)
        return; // a closed dialog has no geometry
    const box = wanted(dialog);
    if (dialog.style.width)
        box.width = dialog.style.width;
    if (dialog.style.height)
        box.height = dialog.style.height;
    const known = selectReactLib(store.getState()).dialogs.boxes[id];
    if (known &&
        known.x === box.x &&
        known.y === box.y &&
        known.width === box.width &&
        known.height === box.height)
        return;
    store.dispatch(dialogBoxSaved({ id, box }));
    void reactLibHandlers()
        .saveDialogBox(id, box)
        .catch(() => undefined);
}
