import { describe, expect, it } from "vitest";
import { createTestStore, libState } from "../../../testing/index.js";
import {
  dialogBoxesLoaded,
  dialogBoxesReset,
  dialogBoxSaved,
  dialogClosed,
  dialogLimitSet,
  dialogOpened,
} from "../../../modules/dialogs/index.js";

describe("dialogs slice", () => {
  it("starts empty with room for one dialog", () => {
    expect(libState(createTestStore()).dialogs).toEqual({
      openIds: [],
      limit: 1,
      boxes: {},
      boxesReset: 0,
    });
  });

  it("keeps only the newest dialog while the limit is 1", () => {
    const store = createTestStore();
    store.dispatch(dialogOpened({ id: "a" }));
    store.dispatch(dialogOpened({ id: "b" }));
    expect(libState(store).dialogs.openIds).toEqual(["b"]);
  });

  it("evicts the oldest ones beyond a higher limit and re-opening moves a dialog to the end", () => {
    const store = createTestStore();
    store.dispatch(dialogLimitSet("2"));
    store.dispatch(dialogOpened({ id: "a" }));
    store.dispatch(dialogOpened({ id: "b" }));
    store.dispatch(dialogOpened({ id: "a" }));
    expect(libState(store).dialogs.openIds).toEqual(["b", "a"]);
    store.dispatch(dialogOpened({ id: "c" }));
    expect(libState(store).dialogs.openIds).toEqual(["a", "c"]);
  });

  it("forgets a closed dialog", () => {
    const store = createTestStore();
    store.dispatch(dialogOpened({ id: "a" }));
    store.dispatch(dialogClosed({ id: "a" }));
    expect(libState(store).dialogs.openIds).toEqual([]);
  });

  it("never lets the limit drop below 1", () => {
    const store = createTestStore();
    store.dispatch(dialogLimitSet(0));
    expect(libState(store).dialogs.limit).toBe(1);
    store.dispatch(dialogLimitSet("abc"));
    expect(libState(store).dialogs.limit).toBe(1);
    store.dispatch(dialogLimitSet(3));
    expect(libState(store).dialogs.limit).toBe(3);
  });

  it("loads, saves and resets the remembered boxes", () => {
    const store = createTestStore();
    store.dispatch(dialogBoxesLoaded({ a: { x: 0.1, y: 0.2 } }));
    store.dispatch(dialogBoxSaved({ id: "b", box: { x: 1, y: 0, width: "300px" } }));
    expect(libState(store).dialogs.boxes).toEqual({
      a: { x: 0.1, y: 0.2 },
      b: { x: 1, y: 0, width: "300px" },
    });
    store.dispatch(dialogBoxesReset());
    expect(libState(store).dialogs.boxes).toEqual({});
    expect(libState(store).dialogs.boxesReset).toBe(1);
  });
});
