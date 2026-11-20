import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { configureReactLib, reactLibHandlers, REACT_LIB_STATE_KEY } from "../../core/index.js";
import { customColorsSet } from "../../modules/colorField/index.js";
import { useReactLibSelector } from "../../core/index.js";
import {
  createTestStore,
  installDomStubs,
  libState,
  renderWithLibStore,
  resetReactLib,
} from "../../testing/index.js";

function Colors() {
  const colors = useReactLibSelector((state) => state.colorField.customColors);
  return <p>{colors.join(",")}</p>;
}

describe("createTestStore", () => {
  it("mounts the lib reducer under the lib key", () => {
    const store = createTestStore();
    expect(Object.keys(store.getState())).toEqual([REACT_LIB_STATE_KEY]);
    expect(libState(store).jobs.view).toBeNull();
  });

  it("adds app reducers and keeps a preloaded app state", () => {
    const store = createTestStore({ app: { n: 3 } }, { app: (state: unknown = { n: 0 }) => state });
    expect(store.getState().app).toEqual({ n: 3 });
  });
});

describe("renderWithLibStore", () => {
  it("provides the store to the lib hooks and returns it", () => {
    const store = createTestStore();
    store.dispatch(customColorsSet(["#111111"]));
    const result = renderWithLibStore(<Colors />, store);
    expect(result.store).toBe(store);
    expect(screen.getByText("#111111")).toBeInTheDocument();
  });

  it("creates a store when none is given", () => {
    const result = renderWithLibStore(<Colors />);
    expect(libState(result.store).colorField.customColors).toEqual([]);
  });
});

describe("installDomStubs", () => {
  it("makes dialogs and pointer capture work in jsdom", () => {
    installDomStubs();
    const dialog = document.createElement("dialog");
    dialog.showModal();
    expect(dialog.open).toBe(true);
    expect(dialog.dataset.modal).toBe("true");
    dialog.show();
    expect(dialog.dataset.modal).toBeUndefined();
    dialog.close();
    expect(dialog.open).toBe(false);
    expect(dialog.hasPointerCapture(1)).toBe(false);
    expect(dialog.setPointerCapture(1)).toBeUndefined();
    expect(dialog.releasePointerCapture(1)).toBeUndefined();
  });
});

describe("resetReactLib", () => {
  it("puts the handlers back to their defaults", () => {
    const openTab = vi.fn();
    configureReactLib({ openTab });
    resetReactLib();
    reactLibHandlers().openTab("plan");
    expect(openTab).not.toHaveBeenCalled();
  });
});
