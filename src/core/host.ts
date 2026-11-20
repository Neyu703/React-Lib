import type { DialogBox } from "../modules/dialogs/index.js";
import type { AuthApi } from "../modules/auth/index.js";
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
  /** The REST client of the sign-in (`createAuthApi`); without it the lib talks to `/api/auth`. */
  authApi?: AuthApi;
}

const NOTHING: ReactLibHandlers = {
  saveDialogBox: () => Promise.resolve(),
  loadCustomColors: () => Promise.resolve([]),
  saveCustomColors: (colors) => Promise.resolve(colors),
  startUpdate: () => Promise.resolve({ state: "failed", message: "" }),
  openTab: () => undefined,
  autoCloseChanged: () => undefined,
};

let handlers: ReactLibHandlers = NOTHING;

/** Replaces the given handlers; the others keep their harmless defaults. */
export const configureReactLib = (next: Partial<ReactLibHandlers>): void => {
  handlers = { ...NOTHING, ...next };
};

export const reactLibHandlers = (): ReactLibHandlers => handlers;
