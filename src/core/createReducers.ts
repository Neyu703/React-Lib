import { combineReducers, type Reducer, type ReducersMapObject, type UnknownAction } from "@reduxjs/toolkit";
import { colorFieldModule, type ColorFieldState } from "../modules/colorField/index.js";
import { dialogsModule, type DialogsState } from "../modules/dialogs/index.js";
import { jobsModule, type JobsState } from "../modules/jobs/index.js";
import { portalThemeModule, type PortalThemeState } from "../modules/portalTheme/index.js";
import { updaterModule } from "../modules/updater/index.js";
import { confirmModule } from "../modules/confirm/index.js";

/** The shape every lib module exports: an optional slice (`reducerKey` + `reducer`) and its components. Modules without state leave the first two out. */
export type ReactLibModule =
  | {
      reducerKey: string;
      reducer(state: never, action: UnknownAction): unknown;
      components?: object;
    }
  | { reducerKey?: undefined; reducer?: undefined; components?: object };

/** The state of all lib modules; what `reactLibReducer` manages under `REACT_LIB_STATE_KEY`. */
export interface ReactLibState {
  portalTheme: PortalThemeState;
  dialogs: DialogsState;
  jobs: JobsState;
  colorField: ColorFieldState;
}

/** Every module of the lib, in the order of their slices. */
export const ALL_REACT_LIB_MODULES: readonly ReactLibModule[] = [
  portalThemeModule,
  dialogsModule,
  jobsModule,
  colorFieldModule,
  updaterModule,
  confirmModule,
];

/**
 * Combines the slices of the chosen modules (default: all) into one reducer.
 * A subset only works for the components of those modules (e.g. `ColorField` needs `colorFieldModule`).
 */
export function createReactLibReducers(): Reducer<ReactLibState>;
export function createReactLibReducers(
  modules: readonly ReactLibModule[],
): Reducer<Partial<ReactLibState>>;
export function createReactLibReducers(
  modules: readonly ReactLibModule[] = ALL_REACT_LIB_MODULES,
): Reducer<ReactLibState> | Reducer<Partial<ReactLibState>> {
  const slices: ReducersMapObject = {};
  for (const module of modules) {
    if (module.reducerKey !== undefined) slices[module.reducerKey] = module.reducer as Reducer;
  }
  return combineReducers(slices) as unknown as Reducer<Partial<ReactLibState>>;
}

/** The state of all lib components; mount it in the app's store: `{ [REACT_LIB_STATE_KEY]: reactLibReducer }`. */
export const reactLibReducer = createReactLibReducers();
