import { type useReactLibStore } from "../../core/hooks.js";
/** Remembers the position and size of a floating dialog in the state and tells the host to keep it. */
export declare function saveDialogBox(store: ReturnType<typeof useReactLibStore>, id: string, dialog: HTMLDialogElement): void;
