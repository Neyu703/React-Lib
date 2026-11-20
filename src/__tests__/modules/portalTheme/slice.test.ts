import { describe, expect, it } from "vitest";
import { createTestStore, libState } from "../../../testing/index.js";
import { applyPortalTheme, portalThemeSet } from "../../../modules/portalTheme/index.js";

describe("portalTheme slice", () => {
  it("holds what the app pushes and starts as a fixed dialog look", () => {
    const store = createTestStore();
    expect(libState(store).portalTheme).toEqual({
      dialogMode: "fixed",
      attributes: {},
      cssVariables: {},
    });
    const next = { dialogMode: "float", attributes: { "data-theme": "dark" }, cssVariables: {} };
    store.dispatch(portalThemeSet(next));
    expect(libState(store).portalTheme).toEqual(next);
  });

  it("applies attributes, removes null ones and sets the variables on a root element", () => {
    const root = document.createElement("html");
    root.setAttribute("data-theme", "light");
    applyPortalTheme(root, {
      dialogMode: "window",
      attributes: { "data-dim": "off", "data-theme": null },
      cssVariables: { "--accent": "red" },
    });
    expect(root.getAttribute("data-dim")).toBe("off");
    expect(root.hasAttribute("data-theme")).toBe(false);
    expect(root.style.getPropertyValue("--accent")).toBe("red");
  });
});
