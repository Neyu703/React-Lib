import { applyPortalTheme } from "./apply.js";
import { portalThemeSet } from "./slice.js";
/** Module form: `reducerKey` + `reducer` for `createReactLibReducers`; no components. */
export declare const portalThemeModule: {
    readonly reducerKey: "portalTheme";
    readonly reducer: import("@reduxjs/toolkit").Reducer<import("./types.js").PortalThemeState>;
};
export { applyPortalTheme, portalThemeSet };
export type { PortalThemeState } from "./types.js";
