const NOTHING = {
    saveDialogBox: () => Promise.resolve(),
    loadCustomColors: () => Promise.resolve([]),
    saveCustomColors: (colors) => Promise.resolve(colors),
    startUpdate: () => Promise.resolve({ state: "failed", message: "" }),
    openTab: () => undefined,
    autoCloseChanged: () => undefined,
};
let handlers = NOTHING;
/** Replaces the given handlers; the others keep their harmless defaults. */
export const configureReactLib = (next) => {
    handlers = { ...NOTHING, ...next };
};
export const reactLibHandlers = () => handlers;
