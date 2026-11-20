import { describe, expect, it } from "vitest";
import { createTestStore, libState } from "../../../testing/index.js";
import { customColorsSet } from "../../../modules/colorField/index.js";

describe("colorField slice", () => {
  it("holds the user's own colours", () => {
    const store = createTestStore();
    expect(libState(store).colorField.customColors).toEqual([]);
    store.dispatch(customColorsSet(["#112233"]));
    expect(libState(store).colorField.customColors).toEqual(["#112233"]);
  });
});
