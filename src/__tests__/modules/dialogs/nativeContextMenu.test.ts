import { describe, expect, it } from "vitest";
import { blockNativeContextMenu } from "../../../modules/dialogs/nativeContextMenu.js";

describe("blockNativeContextMenu", () => {
  it("prevents the default of a contextmenu event on the given document only", () => {
    const blocked = document.implementation.createHTMLDocument("blocked");
    const untouched = document.implementation.createHTMLDocument("untouched");
    blockNativeContextMenu(blocked);
    const onBlocked = new Event("contextmenu", { cancelable: true });
    const onUntouched = new Event("contextmenu", { cancelable: true });
    blocked.dispatchEvent(onBlocked);
    untouched.dispatchEvent(onUntouched);
    expect(onBlocked.defaultPrevented).toBe(true);
    expect(onUntouched.defaultPrevented).toBe(false);
  });
});
