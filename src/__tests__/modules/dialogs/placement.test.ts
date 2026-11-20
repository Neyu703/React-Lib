import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { moveTo, place, remember, wanted } from "../../../modules/dialogs/placement.js";

const dialogWith = (rect: Partial<DOMRect>): HTMLDialogElement => {
  const dialog = document.createElement("dialog");
  dialog.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 0, height: 0, ...rect }) as DOMRect;
  return dialog;
};

beforeEach(() => {
  window.innerWidth = 1000;
  window.innerHeight = 800;
});
afterEach(() => {
  window.innerWidth = 1024;
  window.innerHeight = 768;
});

describe("moveTo", () => {
  it("moves inside the window and limits the maximum size", () => {
    const dialog = dialogWith({ width: 200, height: 100 });
    moveTo(dialog, 300, 200);
    expect(dialog.style.left).toBe("300px");
    expect(dialog.style.top).toBe("200px");
    expect(dialog.style.maxWidth).toBe("700px");
    expect(dialog.style.maxHeight).toBe("600px");
  });

  it("clamps negative and too large positions", () => {
    const dialog = dialogWith({ width: 200, height: 100 });
    moveTo(dialog, -50, 5000);
    expect([dialog.style.left, dialog.style.top]).toEqual(["0px", "700px"]);
    moveTo(dialog, 5000, -5);
    expect([dialog.style.left, dialog.style.top]).toEqual(["800px", "0px"]);
  });

  it("stays at 0 when the dialog is larger than the window", () => {
    const dialog = dialogWith({ width: 2000, height: 2000 });
    moveTo(dialog, 40, 40);
    expect([dialog.style.left, dialog.style.top]).toEqual(["0px", "0px"]);
  });
});

describe("remember and wanted", () => {
  it("stores the position as fractions of the free space", () => {
    const dialog = dialogWith({ left: 400, top: 350, width: 200, height: 100 });
    remember(dialog);
    expect(wanted(dialog)).toEqual({ x: 0.5, y: 0.5 });
  });

  it("clamps fractions to 0..1", () => {
    const dialog = dialogWith({ left: -100, top: 5000, width: 200, height: 100 });
    remember(dialog);
    expect(wanted(dialog)).toEqual({ x: 0, y: 1 });
  });

  it("centres when there is no free space", () => {
    const dialog = dialogWith({ left: 0, top: 0, width: 1000, height: 800 });
    remember(dialog);
    expect(wanted(dialog)).toEqual({ x: 0.5, y: 0.5 });
  });
});

describe("place", () => {
  it("puts the dialog where the wanted fractions say", () => {
    const dialog = dialogWith({ width: 200, height: 100 });
    dialog.dataset.wantedX = "0.5";
    dialog.dataset.wantedY = "1";
    place(dialog);
    expect([dialog.style.left, dialog.style.top]).toEqual(["400px", "700px"]);
  });

  it("copes with a dialog larger than the window", () => {
    const dialog = dialogWith({ width: 3000, height: 3000 });
    dialog.dataset.wantedX = "0.5";
    dialog.dataset.wantedY = "0.5";
    place(dialog);
    expect([dialog.style.left, dialog.style.top]).toEqual(["0px", "0px"]);
  });
});
