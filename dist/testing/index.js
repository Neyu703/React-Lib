import { configureStore, } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { Provider } from "react-redux";
import { reactLibReducer, REACT_LIB_STATE_KEY, selectReactLib, } from "../core/index.js";
/**
 * A store the way a host app mounts the lib: `reactLibReducer` under `REACT_LIB_STATE_KEY`.
 * `preloaded` is the root state to start from; `extraReducers` adds the app's own slices.
 */
export function createTestStore(preloaded, extraReducers = {}) {
    return configureStore({
        reducer: { ...extraReducers, [REACT_LIB_STATE_KEY]: reactLibReducer },
        preloadedState: preloaded,
    });
}
/** The lib's part of the store state, for assertions. */
export const libState = (store) => selectReactLib(store.getState());
/** Renders `ui` inside a react-redux Provider; returns the store with the usual render result. */
export function renderWithLibStore(ui, store = createTestStore()) {
    const wrapper = ({ children }) => createElement(Provider, { store, children });
    return { store, ...render(ui, { wrapper }) };
}
export { fakeAuthApi } from "./fakeAuthApi.js";
export { installDomStubs } from "./domStubs.js";
export { resetReactLib } from "./reset.js";
