import type { Dispatch, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { REACT_LIB_STATE_KEY } from "./stateKey.js";
import type { ReactLibState } from "./createReducers.js";
type HostState = {
    [REACT_LIB_STATE_KEY]: ReactLibState;
};
export declare const selectReactLib: (root: HostState) => ReactLibState;
export declare const useReactLibSelector: <Selected>(select: (state: ReactLibState) => Selected) => Selected;
export declare const useReactLibDispatch: () => Dispatch<UnknownAction>;
/** Dispatch that also takes thunks (the store needs the thunk middleware, which `configureStore` adds by default). */
export declare const useReactLibThunk: () => ThunkDispatch<HostState, undefined, UnknownAction>;
/** For reading the current state inside event handlers and effects without subscribing to it. */
export declare const useReactLibStore: () => import("@reduxjs/toolkit").Store<HostState, UnknownAction, unknown>;
export {};
