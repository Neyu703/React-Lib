import { describe, expect, it } from "vitest";
import {
  ALL_REACT_LIB_MODULES,
  createReactLibReducers,
  reactLibReducer,
  REACT_LIB_STATE_KEY,
} from "../../core/index.js";
import { colorFieldModule } from "../../modules/colorField/index.js";
import { confirmModule } from "../../modules/confirm/index.js";
import { dialogsModule } from "../../modules/dialogs/index.js";
import { updaterModule } from "../../modules/updater/index.js";

const init = { type: "@@init" };

describe("createReactLibReducers", () => {
  it("mounts under the documented key", () => {
    expect(REACT_LIB_STATE_KEY).toBe("reactLib");
  });

  it("combines the slices of all modules by default", () => {
    const state = createReactLibReducers()(undefined, init);
    expect(Object.keys(state).sort()).toEqual(["colorField", "dialogs", "jobs", "portalTheme"]);
    expect(Object.keys(reactLibReducer(undefined, init)).sort()).toEqual(Object.keys(state).sort());
    expect(ALL_REACT_LIB_MODULES).toContain(updaterModule);
  });

  it("builds only the slices of the chosen modules and skips modules without state", () => {
    const state = createReactLibReducers([dialogsModule, colorFieldModule, updaterModule, confirmModule])(
      undefined,
      init,
    );
    expect(Object.keys(state).sort()).toEqual(["colorField", "dialogs"]);
  });

  it("declares reducerKey, reducer and components in the documented form", () => {
    expect(dialogsModule.reducerKey).toBe("dialogs");
    expect(typeof dialogsModule.reducer).toBe("function");
    expect(Object.keys(dialogsModule.components)).toEqual(["Modal", "DialogFrame"]);
    expect("reducer" in updaterModule).toBe(false);
  });
});
