import { type EnhancedStore, type ReducersMapObject } from "@reduxjs/toolkit";
import { type RenderResult } from "@testing-library/react";
import { type ReactElement } from "react";
import { REACT_LIB_STATE_KEY, type ReactLibState } from "../core/index.js";
/** What a store from `createTestStore` holds: the lib state under `REACT_LIB_STATE_KEY` plus whatever the app added. */
export type TestRootState = {
    [REACT_LIB_STATE_KEY]: ReactLibState;
} & Record<string, unknown>;
export type TestStore = EnhancedStore<TestRootState>;
/**
 * A store the way a host app mounts the lib: `reactLibReducer` under `REACT_LIB_STATE_KEY`.
 * `preloaded` is the root state to start from; `extraReducers` adds the app's own slices.
 */
export declare function createTestStore(preloaded?: Partial<TestRootState>, extraReducers?: ReducersMapObject): TestStore;
/** The lib's part of the store state, for assertions. */
export declare const libState: (store: TestStore) => ReactLibState;
/** Renders `ui` inside a react-redux Provider; returns the store with the usual render result. */
export declare function renderWithLibStore(ui: ReactElement, store?: TestStore): RenderResult & {
    store: TestStore;
};
export { fakeAuthApi } from "./fakeAuthApi.js";
export { installDomStubs } from "./domStubs.js";
export { resetReactLib } from "./reset.js";
