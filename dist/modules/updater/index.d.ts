import { ChangelogDialog } from "./ChangelogDialog.js";
import { UpdateDialog } from "./UpdateDialog.js";
/** Module form without state: no `reducerKey` / `reducer`, only `components`. */
export declare const updaterModule: {
    readonly components: {
        readonly UpdateDialog: typeof UpdateDialog;
        readonly ChangelogDialog: typeof ChangelogDialog;
    };
};
export { ChangelogDialog, UpdateDialog };
export type { ChangelogData, ChangelogEntry, UpdateInfo, UpdateStatus } from "./types.js";
