// Contracts for the update and changelog dialogs; the backend delivers them, the lib does not know the endpoints.

/** Result of the host's `startUpdate` handler (response of the "install update" endpoint). state "failed" = not started. */
export interface UpdateStatus {
  state: string;
  message: string;
}

/** Input of `UpdateDialog`: what the "is an update available" endpoint reports. */
export interface UpdateInfo {
  state: string;
  info: string;
}

export interface ChangelogEntry {
  group: string;
  date: string;
  title: string;
  text: string;
}

/** Input of `ChangelogDialog`: response of the changelog endpoint. `hidden` = the "do not show again" flag. */
export interface ChangelogData {
  entries: ChangelogEntry[];
  hidden: boolean;
}
