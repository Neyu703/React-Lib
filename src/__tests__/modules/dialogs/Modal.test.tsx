import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Modal } from "../../../modules/dialogs/Modal.js";
import {
  dialogBoxesLoaded,
  dialogBoxesReset,
  dialogLimitSet,
} from "../../../modules/dialogs/index.js";
import { configureReactLib } from "../../../core/index.js";
import { portalThemeSet, type PortalThemeState } from "../../../modules/portalTheme/index.js";
import { libState, createTestStore, renderWithLibStore, type TestStore } from "../../../testing/index.js";

const RECT = { left: 100, top: 50, width: 200, height: 100, right: 300, bottom: 150, x: 100, y: 50 };

const setMode = (store: TestStore, dialogMode: string, extra: Partial<PortalThemeState> = {}) =>
  act(() => {
    store.dispatch(portalThemeSet({ dialogMode, attributes: {}, cssVariables: {}, ...extra }));
  });

const modal = (
  props: Partial<React.ComponentProps<typeof Modal>> = {},
  content = "Inhalt",
): ReactElement => (
  <Modal
    id="m"
    windowTitle="Titel"
    open
    onClose={() => undefined}
    {...props}
  >
    <p>{content}</p>
  </Modal>
);

const dialogOf = (container: Element | Document = document): HTMLDialogElement =>
  container.querySelector("dialog") as HTMLDialogElement;

const stubRect = () =>
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(RECT as DOMRect);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Modal fixed", () => {
  it("shows a modal dialog with its content, ids and classes", () => {
    renderWithLibStore(modal({ className: "wide", labelledBy: "t" }));
    const dialog = dialogOf();
    expect(dialog).toHaveAttribute("open");
    expect(dialog.dataset.modal).toBe("true");
    expect(dialog).toHaveClass("wide");
    expect(dialog).not.toHaveClass("floating");
    expect(dialog).toHaveAttribute("id", "m");
    expect(dialog).toHaveAttribute("aria-labelledby", "t");
    expect(dialog.dataset.windowTitle).toBe("Titel");
    expect(screen.getByText("Inhalt")).toBeInTheDocument();
  });

  it("registers itself as open and unregisters on unmount", () => {
    const { store, unmount } = renderWithLibStore(modal());
    expect(libState(store).dialogs.openIds).toEqual(["m"]);
    unmount();
    expect(libState(store).dialogs.openIds).toEqual([]);
  });

  it("renders nothing but an empty closed dialog while closed", () => {
    renderWithLibStore(modal({ open: false }));
    expect(dialogOf()).not.toHaveAttribute("open");
    expect(screen.queryByText("Inhalt")).toBeNull();
    expect(screen.queryByRole("button", { hidden: true })).toBeNull();
  });

  it("closes the native dialog when open turns false", () => {
    const store = createTestStore();
    const { rerender } = renderWithLibStore(modal(), store);
    expect(dialogOf()).toHaveAttribute("open");
    rerender(modal({ open: false }));
    expect(dialogOf()).not.toHaveAttribute("open");
    expect(libState(store).dialogs.openIds).toEqual([]);
  });

  it("closes a dialog that is still open when it is told to stay closed", () => {
    const { rerender } = renderWithLibStore(modal({ open: false }));
    const dialog = dialogOf();
    dialog.setAttribute("open", "");
    rerender(modal({ open: false, exempt: true }));
    expect(dialog).not.toHaveAttribute("open");
  });

  it("does not show an already open dialog again", () => {
    const { rerender } = renderWithLibStore(modal());
    const dialog = dialogOf();
    const close = vi.fn();
    dialog.close = close;
    const show = vi.spyOn(dialog, "showModal");
    rerender(modal({ exempt: true }));
    expect(close).toHaveBeenCalled();
    expect(show).not.toHaveBeenCalled();
  });

  it("copes with a dialog that was closed from outside before unmount", () => {
    const { unmount } = renderWithLibStore(modal());
    dialogOf().removeAttribute("open");
    expect(() => unmount()).not.toThrow();
  });

  it("closes through the close button", () => {
    const onClose = vi.fn();
    renderWithLibStore(modal({ onClose }));
    fireEvent.click(screen.getByRole("button", { name: "Schließen" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has no close button while Esc is blocked", () => {
    renderWithLibStore(modal({ blockEscape: true }));
    expect(screen.queryByRole("button", { name: "Schließen" })).toBeNull();
  });

  it("turns the cancel event into onClose and keeps the dialog open", () => {
    const onClose = vi.fn();
    renderWithLibStore(modal({ onClose }));
    const cancel = new Event("cancel", { bubbles: false, cancelable: true });
    fireEvent(dialogOf(), cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ignores the cancel event while Esc is blocked", () => {
    const onClose = vi.fn();
    renderWithLibStore(modal({ onClose, blockEscape: true }));
    const cancel = new Event("cancel", { cancelable: true });
    fireEvent(dialogOf(), cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls the newest onClose without reopening the dialog", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderWithLibStore(modal({ onClose: first }));
    const dialog = dialogOf();
    dialog.dataset.marker = "kept";
    rerender(modal({ onClose: second }));
    fireEvent.click(screen.getByRole("button", { name: "Schließen" }));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(dialogOf().dataset.marker).toBe("kept");
  });

  it("does not drag in fixed mode", () => {
    const rect = stubRect();
    renderWithLibStore(modal());
    fireEvent.pointerDown(dialogOf(), { button: 0, clientX: 120, clientY: 60, pointerId: 1 });
    expect(dialogOf().style.zIndex).toBe("");
    expect(rect).not.toHaveBeenCalled();
  });

  it("ignores a reset request while not floating", () => {
    const { store } = renderWithLibStore(modal());
    act(() => {
      store.dispatch(dialogBoxesReset());
    });
    expect(dialogOf().dataset.wantedX).toBeUndefined();
  });
});

describe("Modal exempt and the dialog limit", () => {
  it("stays fixed and unregistered although the app wants floating dialogs", () => {
    const store = createTestStore();
    setMode(store, "float");
    renderWithLibStore(modal({ exempt: true }), store);
    expect(dialogOf().dataset.modal).toBe("true");
    expect(dialogOf()).not.toHaveClass("floating");
    expect(libState(store).dialogs.openIds).toEqual([]);
  });

  it("asks the older dialog to close when the limit is reached", () => {
    const store = createTestStore();
    const closeOlder = vi.fn();
    const closeNewer = vi.fn();
    const older = <Modal id="a" windowTitle="A" open onClose={closeOlder}>a</Modal>;
    const newer = <Modal id="b" windowTitle="B" open onClose={closeNewer}>b</Modal>;
    const { rerender } = renderWithLibStore(older, store);
    expect(libState(store).dialogs.openIds).toEqual(["a"]);
    rerender(
      <>
        {older}
        {newer}
      </>,
    );
    expect(libState(store).dialogs.openIds).toEqual(["b"]);
    expect(closeOlder).toHaveBeenCalledTimes(1);
    expect(closeNewer).not.toHaveBeenCalled();
  });

  it("does not call onClose when the dialog unregisters because it was closed by its owner", () => {
    const onClose = vi.fn();
    const { rerender } = renderWithLibStore(modal({ onClose }));
    rerender(modal({ onClose, open: false }));
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("Modal floating", () => {
  let store: TestStore;
  beforeEach(() => {
    store = createTestStore();
    setMode(store, "float");
  });

  it("shows a non-modal floating dialog centred by default", () => {
    renderWithLibStore(modal(), store);
    const dialog = dialogOf();
    expect(dialog).toHaveAttribute("open");
    expect(dialog.dataset.modal).toBeUndefined();
    expect(dialog).toHaveClass("floating");
    expect(dialog.dataset.wantedX).toBe("0.5");
    expect(dialog.dataset.wantedY).toBe("0.5");
    expect(Number(dialog.style.zIndex)).toBeGreaterThan(1000);
    expect(dialog.style.width).toBe("");
  });

  it("restores a remembered position and size from the state", () => {
    store.dispatch(
      dialogBoxesLoaded({ m: { x: 0.1, y: 0.2, width: "300px", height: "200px" } }),
    );
    renderWithLibStore(modal(), store);
    const dialog = dialogOf();
    expect(dialog.dataset.wantedX).toBe("0.1");
    expect(dialog.dataset.wantedY).toBe("0.2");
    expect(dialog.style.width).toBe("300px");
    expect(dialog.style.height).toBe("200px");
  });

  it("restores a remembered position without a size", () => {
    store.dispatch(dialogBoxesLoaded({ m: { x: 0, y: 1 } }));
    renderWithLibStore(modal(), store);
    expect(dialogOf().dataset.wantedY).toBe("1");
    expect(dialogOf().style.width).toBe("");
    expect(dialogOf().style.height).toBe("");
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    renderWithLibStore(modal({ onClose }), store);
    fireEvent.keyDown(document, { key: "a" });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ignores Escape while it is blocked", () => {
    const onClose = vi.fn();
    renderWithLibStore(modal({ onClose, blockEscape: true }), store);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes only the topmost dialog on Escape and raises one when it is pressed", () => {
    store.dispatch(dialogLimitSet(2));
    const closeA = vi.fn();
    const closeB = vi.fn();
    const both = (
      <>
        <Modal id="a" windowTitle="A" open onClose={closeA}>a</Modal>
        <Modal id="b" windowTitle="B" open onClose={closeB}>b</Modal>
      </>
    );
    renderWithLibStore(both, store);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(closeA).not.toHaveBeenCalled();
    expect(closeB).toHaveBeenCalledTimes(1);

    stubRect();
    const first = document.getElementById("a") as HTMLDialogElement;
    fireEvent.pointerDown(first, { button: 0, clientX: 500, clientY: 500, pointerId: 1 });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(closeA).toHaveBeenCalledTimes(1);
    expect(closeB).toHaveBeenCalledTimes(1);
  });

  it("refits on window resize", () => {
    renderWithLibStore(modal(), store);
    const dialog = dialogOf();
    expect(dialog.style.maxWidth).toBe("512px");
    window.innerWidth = 700;
    fireEvent(window, new Event("resize"));
    expect(dialog.style.maxWidth).toBe("350px");
    window.innerWidth = 1024;
  });

  it("remembers and saves the box when a pointer is released anywhere", () => {
    const save = vi.fn().mockResolvedValue(undefined);
    configureReactLib({ saveDialogBox: save });
    stubRect();
    renderWithLibStore(modal(), store);
    fireEvent.pointerUp(window);
    const wantedX = 100 / (window.innerWidth - RECT.width);
    expect(libState(store).dialogs.boxes.m?.x).toBeCloseTo(wantedX, 3);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("drags by the title strip and saves the dropped place", () => {
    const save = vi.fn().mockResolvedValue(undefined);
    configureReactLib({ saveDialogBox: save });
    stubRect();
    renderWithLibStore(modal(), store);
    const dialog = dialogOf();
    Object.defineProperty(dialog, "clientWidth", { value: 200 });
    const before = Number(dialog.style.zIndex);
    fireEvent.pointerDown(dialog, { button: 0, clientX: 150, clientY: 60, pointerId: 1 });
    expect(Number(dialog.style.zIndex)).toBeGreaterThan(before);
    fireEvent.pointerMove(dialog, { clientX: 250, clientY: 160, pointerId: 1 });
    expect(dialog.style.left).toBe("200px");
    expect(dialog.style.top).toBe("150px");
    fireEvent.pointerUp(dialog, { pointerId: 1 });
    expect(save).toHaveBeenCalled();
    const dropped = dialog.style.left;
    fireEvent.pointerMove(dialog, { clientX: 900, clientY: 700, pointerId: 1 });
    expect(dialog.style.left).toBe(dropped);
  });

  it.each([
    ["a secondary button", { button: 2, clientX: 150, clientY: 60 }, "raised-no"],
    ["below the title strip", { button: 0, clientX: 150, clientY: 400 }, "raised"],
    ["right of the content", { button: 0, clientX: 280, clientY: 60 }, "raised"],
  ])("does not start a drag with %s", (_name, init, raised) => {
    stubRect();
    renderWithLibStore(modal(), store);
    const dialog = dialogOf();
    Object.defineProperty(dialog, "clientWidth", { value: 100 });
    const before = Number(dialog.style.zIndex);
    dialog.style.left = "5px";
    fireEvent.pointerDown(dialog, { ...init, pointerId: 1 });
    fireEvent.pointerMove(dialog, { clientX: 300, clientY: 300, pointerId: 1 });
    expect(dialog.style.left).toBe("5px");
    expect(Number(dialog.style.zIndex) > before).toBe(raised === "raised");
  });

  it("does not start a drag on controls inside the title strip", () => {
    stubRect();
    renderWithLibStore(modal(), store);
    const dialog = dialogOf();
    Object.defineProperty(dialog, "clientWidth", { value: 200 });
    dialog.style.left = "5px";
    fireEvent.pointerDown(screen.getByRole("button", { name: "Schließen" }), {
      button: 0,
      clientX: 150,
      clientY: 60,
      pointerId: 1,
    });
    fireEvent.pointerMove(dialog, { clientX: 300, clientY: 300, pointerId: 1 });
    expect(dialog.style.left).toBe("5px");
  });

  it("puts the dialog back in the middle at the original size on a reset", () => {
    store.dispatch(
      dialogBoxesLoaded({ m: { x: 0.1, y: 0.2, width: "300px", height: "200px" } }),
    );
    renderWithLibStore(modal(), store);
    const dialog = dialogOf();
    act(() => {
      store.dispatch(dialogBoxesReset());
    });
    expect(dialog.style.width).toBe("");
    expect(dialog.style.height).toBe("");
    expect(dialog.dataset.wantedX).toBe("0.5");
    expect(dialog.dataset.wantedY).toBe("0.5");
    expect(dialog.style.maxWidth).toBe("512px");
  });
});

interface FakePopup extends EventTarget {
  document: Document;
  closed: boolean;
  close: ReturnType<typeof vi.fn>;
}

const fakePopup = (): FakePopup =>
  Object.assign(new EventTarget(), {
    document: document.implementation.createHTMLDocument(""),
    closed: false,
    close: vi.fn(),
  });

describe("Modal in a popup window", () => {
  let store: TestStore;
  let popup: FakePopup;
  let open: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    store = createTestStore();
    popup = fakePopup();
    open = vi.spyOn(window, "open").mockReturnValue(popup as unknown as Window);
  });

  it("renders into the popup with title, language, copied styles and the app's look", () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "http://localhost/app.css";
    const style = document.createElement("style");
    style.textContent = "p { color: red }";
    document.head.append(link, style);
    popup.document.documentElement.setAttribute("data-old", "1");
    setMode(store, "window", {
      attributes: { "data-theme": "dark", "data-old": null },
      cssVariables: { "--accent": "#123456" },
    });
    const { container } = renderWithLibStore(modal(), store);
    link.remove();
    style.remove();

    expect(open).toHaveBeenCalledWith("", "dialog-m", expect.stringContaining("popup=yes"));
    expect(popup.document.title).toBe("Dienstplan · Titel");
    expect(popup.document.documentElement.lang).toBe("de");
    expect(popup.document.head.querySelector("link")?.getAttribute("href")).toBe(
      "http://localhost/app.css",
    );
    expect(popup.document.head.querySelector("style")?.textContent).toBe("p { color: red }");
    const root = popup.document.documentElement;
    expect(root.getAttribute("data-theme")).toBe("dark");
    expect(root.hasAttribute("data-old")).toBe(false);
    expect(root.style.getPropertyValue("--accent")).toBe("#123456");

    const dialog = dialogOf(popup.document);
    expect(dialog.classList.contains("in-window")).toBe(true);
    expect(dialog.classList.contains("floating")).toBe(false);
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(dialog.dataset.modal).toBeUndefined();
    expect(popup.document.querySelector(".dialog-close")).toBeNull();
    expect(container.querySelector("dialog")).toBeNull();
    expect(popup.document.body.textContent).toBe("Inhalt");
  });

  it("closes on Escape in the popup and blocks its native context menu", () => {
    const onClose = vi.fn();
    setMode(store, "window");
    renderWithLibStore(modal({ onClose }), store);
    popup.document.dispatchEvent(new KeyboardEvent("keydown", { key: "x" }));
    expect(onClose).not.toHaveBeenCalled();
    popup.document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    const menu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    popup.document.body.dispatchEvent(menu);
    expect(menu.defaultPrevented).toBe(true);
  });

  it("closes when the user closes the popup window", () => {
    const onClose = vi.fn();
    setMode(store, "window");
    renderWithLibStore(modal({ onClose }), store);
    popup.dispatchEvent(new Event("pagehide"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes the popup when the dialog goes away", () => {
    setMode(store, "window");
    const { unmount } = renderWithLibStore(modal(), store);
    unmount();
    expect(popup.close).toHaveBeenCalledTimes(1);
  });

  it("does not close a popup that the user already closed", () => {
    setMode(store, "window");
    const { unmount } = renderWithLibStore(modal(), store);
    popup.closed = true;
    unmount();
    expect(popup.close).not.toHaveBeenCalled();
  });

  it("falls back to a floating dialog when the browser blocks the popup", () => {
    open.mockReturnValue(null);
    setMode(store, "window");
    renderWithLibStore(modal(), store);
    const dialog = dialogOf();
    expect(dialog).toHaveClass("floating");
    expect(dialog).not.toHaveClass("in-window");
    expect(screen.getByRole("button", { name: "Schließen" })).toBeInTheDocument();
  });

  it("opens no popup for an exempt dialog", () => {
    setMode(store, "window");
    renderWithLibStore(modal({ exempt: true }), store);
    expect(open).not.toHaveBeenCalled();
  });

  it("opens no popup while closed", () => {
    setMode(store, "window");
    renderWithLibStore(modal({ open: false }), store);
    expect(open).not.toHaveBeenCalled();
  });

  it("takes a changed look over into an open popup", () => {
    setMode(store, "window");
    renderWithLibStore(modal(), store);
    setMode(store, "window", { cssVariables: { "--accent": "#abcdef" } });
    expect(popup.document.documentElement.style.getPropertyValue("--accent")).toBe("#abcdef");
  });

  it("survives a reload of the main window without reporting a close", () => {
    const onClose = vi.fn();
    setMode(store, "window");
    renderWithLibStore(modal({ onClose }), store);
    window.dispatchEvent(new Event("pagehide"));
    popup.dispatchEvent(new Event("pagehide"));
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("Modal without a provider", () => {
  it("needs the lib's store", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(modal())).toThrow();
  });

  it("works inside a plain Provider", () => {
    render(<Provider store={createTestStore()}>{modal()}</Provider>);
    expect(dialogOf()).toHaveAttribute("open");
  });
});
