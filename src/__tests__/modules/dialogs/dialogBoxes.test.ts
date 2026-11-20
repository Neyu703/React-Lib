import { describe, expect, it, vi } from "vitest";
import { saveDialogBox } from "../../../modules/dialogs/dialogBoxes.js";
import { dialogBoxSaved } from "../../../modules/dialogs/index.js";
import { configureReactLib } from "../../../core/index.js";
import { libState, createTestStore } from "../../../testing/index.js";

const openDialog = (): HTMLDialogElement => {
  const dialog = document.createElement("dialog");
  dialog.setAttribute("open", "");
  dialog.dataset.wantedX = "0.25";
  dialog.dataset.wantedY = "0.75";
  return dialog;
};

describe("saveDialogBox", () => {
  it("ignores a closed dialog", () => {
    const store = createTestStore();
    const save = vi.fn();
    configureReactLib({ saveDialogBox: save });
    const dialog = openDialog();
    dialog.removeAttribute("open");
    saveDialogBox(store, "d", dialog);
    expect(save).not.toHaveBeenCalled();
    expect(libState(store).dialogs.boxes).toEqual({});
  });

  it("stores position and size in the state and tells the host", () => {
    const store = createTestStore();
    const save = vi.fn().mockResolvedValue(undefined);
    configureReactLib({ saveDialogBox: save });
    const dialog = openDialog();
    dialog.style.width = "300px";
    dialog.style.height = "200px";
    saveDialogBox(store, "d", dialog);
    const box = { x: 0.25, y: 0.75, width: "300px", height: "200px" };
    expect(libState(store).dialogs.boxes.d).toEqual(box);
    expect(save).toHaveBeenCalledWith("d", box);
  });

  it("leaves out an unset size", () => {
    const store = createTestStore();
    saveDialogBox(store, "d", openDialog());
    expect(libState(store).dialogs.boxes.d).toEqual({ x: 0.25, y: 0.75 });
  });

  it("does nothing when the box is unchanged", () => {
    const store = createTestStore();
    const save = vi.fn().mockResolvedValue(undefined);
    configureReactLib({ saveDialogBox: save });
    store.dispatch(dialogBoxSaved({ id: "d", box: { x: 0.25, y: 0.75 } }));
    saveDialogBox(store, "d", openDialog());
    expect(save).not.toHaveBeenCalled();
  });

  it.each([
    ["x", { x: 0.1, y: 0.75 }],
    ["y", { x: 0.25, y: 0.1 }],
    ["width", { x: 0.25, y: 0.75, width: "1px" }],
    ["height", { x: 0.25, y: 0.75, height: "1px" }],
  ])("saves when only the known %s differs", (_name, known) => {
    const store = createTestStore();
    store.dispatch(dialogBoxSaved({ id: "d", box: known }));
    saveDialogBox(store, "d", openDialog());
    expect(libState(store).dialogs.boxes.d).toEqual({ x: 0.25, y: 0.75 });
  });

  it("swallows a failing host save", async () => {
    const save = vi.fn().mockRejectedValue(new Error("down"));
    configureReactLib({ saveDialogBox: save });
    saveDialogBox(createTestStore(), "d", openDialog());
    await Promise.resolve();
    await Promise.resolve();
    expect(save).toHaveBeenCalled();
  });
});
