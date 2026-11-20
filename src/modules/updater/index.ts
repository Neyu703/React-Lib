import { ChangelogDialog } from "./ChangelogDialog.js";
import { UpdateDialog } from "./UpdateDialog.js";

/** Module form without state: no `reducerKey` / `reducer`, only `components`. */
export const updaterModule = {
  components: { UpdateDialog, ChangelogDialog },
} as const;

export { ChangelogDialog, UpdateDialog };
export type { ChangelogData, ChangelogEntry, UpdateInfo, UpdateStatus } from "./types.js";
