import { applyPortalTheme } from "./apply.js";
import { portalThemeReducer, portalThemeSet } from "./slice.js";

/** Module form: `reducerKey` + `reducer` for `createReactLibReducers`; no components. */
export const portalThemeModule = {
  reducerKey: "portalTheme",
  reducer: portalThemeReducer,
} as const;

export { applyPortalTheme, portalThemeSet };
export type { PortalThemeState } from "./types.js";
