import { type Reducer, type UnknownAction } from "@reduxjs/toolkit";
import { type ColorFieldState } from "../modules/colorField/index.js";
import { type DialogsState } from "../modules/dialogs/index.js";
import { type JobsState } from "../modules/jobs/index.js";
import { type PortalThemeState } from "../modules/portalTheme/index.js";
/** The shape every lib module exports: an optional slice (`reducerKey` + `reducer`) and its components. Modules without state leave the first two out. */
export type ReactLibModule = {
    reducerKey: string;
    reducer(state: never, action: UnknownAction): unknown;
    components?: object;
} | {
    reducerKey?: undefined;
    reducer?: undefined;
    components?: object;
};
/** The state of all lib modules; what `reactLibReducer` manages under `REACT_LIB_STATE_KEY`. */
export interface ReactLibState {
    portalTheme: PortalThemeState;
    dialogs: DialogsState;
    jobs: JobsState;
    colorField: ColorFieldState;
}
/** Every module of the lib, in the order of their slices. */
export declare const ALL_REACT_LIB_MODULES: readonly ReactLibModule[];
/**
 * Combines the slices of the chosen modules (default: all) into one reducer.
 * A subset only works for the components of those modules (e.g. `ColorField` needs `colorFieldModule`).
 */
export declare function createReactLibReducers(): Reducer<ReactLibState>;
export declare function createReactLibReducers(modules: readonly ReactLibModule[]): Reducer<Partial<ReactLibState>>;
/** The state of all lib components; mount it in the app's store: `{ [REACT_LIB_STATE_KEY]: reactLibReducer }`. */
export declare const reactLibReducer: Reducer<ReactLibState>;
