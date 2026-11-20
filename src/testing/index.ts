import {
  configureStore,
  type EnhancedStore,
  type Reducer,
  type ReducersMapObject,
  type UnknownAction,
} from "@reduxjs/toolkit";
import { render, type RenderResult } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import { Provider } from "react-redux";
import {
  reactLibReducer,
  REACT_LIB_STATE_KEY,
  selectReactLib,
  type ReactLibState,
} from "../core/index.js";

/** What a store from `createTestStore` holds: the lib state under `REACT_LIB_STATE_KEY` plus whatever the app added. */
export type TestRootState = { [REACT_LIB_STATE_KEY]: ReactLibState } & Record<string, unknown>;
export type TestStore = EnhancedStore<TestRootState>;

/**
 * A store the way a host app mounts the lib: `reactLibReducer` under `REACT_LIB_STATE_KEY`.
 * `preloaded` is the root state to start from; `extraReducers` adds the app's own slices.
 */
export function createTestStore(
  preloaded?: Partial<TestRootState>,
  extraReducers: ReducersMapObject = {},
): TestStore {
  return configureStore({
    reducer: { ...extraReducers, [REACT_LIB_STATE_KEY]: reactLibReducer } as ReducersMapObject,
    preloadedState: preloaded,
  }) as unknown as TestStore;
}

/** The lib's part of the store state, for assertions. */
export const libState = (store: TestStore): ReactLibState => selectReactLib(store.getState());

/** Renders `ui` inside a react-redux Provider; returns the store with the usual render result. */
export function renderWithLibStore(
  ui: ReactElement,
  store: TestStore = createTestStore(),
): RenderResult & { store: TestStore } {
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(Provider, { store, children });
  return { store, ...(render(ui, { wrapper }) as RenderResult) };
}

export { fakeAuthApi } from "./fakeAuthApi.js";
export { installDomStubs } from "./domStubs.js";
export { resetReactLib } from "./reset.js";
