import { describe, expect, it, vi } from "vitest";
import { configureReactLib, reactLibHandlers } from "../../core/index.js";

describe("host handlers", () => {
  it("are harmless until the app configures them", async () => {
    const handlers = reactLibHandlers();
    await expect(handlers.saveDialogBox("a", { x: 0, y: 0 })).resolves.toBeUndefined();
    await expect(handlers.loadCustomColors()).resolves.toEqual([]);
    await expect(handlers.saveCustomColors(["#000000"])).resolves.toEqual(["#000000"]);
    await expect(handlers.startUpdate()).resolves.toEqual({ state: "failed", message: "" });
    expect(handlers.openTab("plan")).toBeUndefined();
    expect(handlers.autoCloseChanged(true)).toBeUndefined();
  });

  it("replace only what is given and fall back to the defaults for the rest", async () => {
    const openTab = vi.fn();
    configureReactLib({ openTab });
    reactLibHandlers().openTab("plan");
    expect(openTab).toHaveBeenCalledWith("plan");
    await expect(reactLibHandlers().loadCustomColors()).resolves.toEqual([]);
  });
});
