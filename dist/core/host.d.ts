import type { DialogBox } from "../modules/dialogs/index.js";
import type { UpdateStatus } from "../modules/updater/index.js";
/** What the lib reports to or asks from the host app. Set once at the start with `configureReactLib`. */
export interface ReactLibHandlers {
    /** A floating dialog was moved or resized: keep its box between starts. */
    saveDialogBox: (id: string, box: DialogBox) => Promise<unknown>;
    loadCustomColors: () => Promise<string[]>;
    /** Saves the user's own colours and returns the list as stored. */
    saveCustomColors: (colors: string[]) => Promise<string[]>;
    /** Asks the server to install the new version. */
    startUpdate: () => Promise<UpdateStatus>;
    /** A link in the changelog wants this tab. */
    openTab: (tab: string) => void;
    /** The user changed "close after success" in the progress dialog: keep the choice. */
    autoCloseChanged: (value: boolean) => void;
}
/** Replaces the given handlers; the others keep their harmless defaults. */
export declare const configureReactLib: (next: Partial<ReactLibHandlers>) => void;
export declare const reactLibHandlers: () => ReactLibHandlers;
