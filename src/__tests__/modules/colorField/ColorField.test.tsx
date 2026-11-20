import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ColorField } from "../../../modules/colorField/ColorField.js";
import { hsvToHex } from "../../../modules/colorField/colors.js";
import { customColorsSet } from "../../../modules/colorField/index.js";
import { configureReactLib } from "../../../core/index.js";
import { libState, createTestStore, renderWithLibStore, type TestStore } from "../../../testing/index.js";

const rectOf = (overrides: Partial<DOMRect> = {}): DOMRect =>
  ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, ...overrides }) as DOMRect;

const stubRect = (rect: DOMRect = rectOf()) =>
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(rect);

afterEach(() => {
  vi.restoreAllMocks();
});

const setup = async (
  options: { value?: string; custom?: string[]; store?: TestStore; props?: object } = {},
) => {
  const onChange = vi.fn();
  const loadCustomColors = vi.fn().mockResolvedValue(options.custom ?? []);
  const saveCustomColors = vi.fn((colors: string[]) => Promise.resolve(colors));
  configureReactLib({ loadCustomColors, saveCustomColors });
  const store = options.store ?? createTestStore();
  const view = renderWithLibStore(
    <ColorField
      value={options.value ?? "#ff0000"}
      onChange={onChange}
      {...options.props}
    />,
    store,
  );
  return { onChange, loadCustomColors, saveCustomColors, store, ...view };
};

const swatch = () => screen.getByRole("button", { name: "Farbe wählen", expanded: undefined });

const openPopover = async (setupResult: Awaited<ReturnType<typeof setup>>) => {
  fireEvent.click(document.querySelector(".color-swatch") as HTMLElement);
  await waitFor(() => expect(setupResult.loadCustomColors).toHaveBeenCalled());
  await act(async () => undefined);
};

const hexInput = () => screen.getByLabelText("Hex-Wert") as HTMLInputElement;

describe("ColorField button", () => {
  it("renders a swatch with the colour, ids and a default label", async () => {
    await setup({ props: { id: "bg", name: "background" } });
    const button = document.querySelector(".color-swatch") as HTMLElement;
    expect(button).toHaveAttribute("id", "bg");
    expect(button.dataset.name).toBe("background");
    expect(button.style.background).toBe("rgb(255, 0, 0)");
    expect(button).toHaveAttribute("aria-label", "Farbe wählen");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector(".color-popover")).toBeNull();
    expect(swatch()).toBe(button);
  });

  it("uses a given aria label", async () => {
    await setup({ props: { ariaLabel: "Hintergrund" } });
    expect(screen.getByRole("button", { name: "Hintergrund" })).toBeInTheDocument();
  });
});

describe("ColorField popover", () => {
  it("renders the presets without a duplicate-key warning", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await setup();
    await openPopover(result);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("opens below the button, loads the own colours and closes with a second click", async () => {
    stubRect(rectOf({ left: 50, bottom: 100 }));
    const result = await setup({ custom: ["#112233"] });
    await openPopover(result);
    const popover = document.querySelector(".color-popover") as HTMLElement;
    expect(popover.style.top).toBe("106px");
    expect(popover.style.left).toBe("50px");
    expect(screen.getByRole("button", { name: "Eigene Farbe #112233" })).toBeInTheDocument();
    expect(libState(result.store).colorField.customColors).toEqual(["#112233"]);
    fireEvent.click(document.querySelector(".color-swatch") as HTMLElement);
    expect(document.querySelector(".color-popover")).toBeNull();
  });

  it("keeps the popover inside the window on the right", async () => {
    stubRect(rectOf({ left: 5000, bottom: 100 }));
    const result = await setup();
    await openPopover(result);
    expect((document.querySelector(".color-popover") as HTMLElement).style.left).toBe(
      `${window.innerWidth - 240}px`,
    );
  });

  it("moves up when it would stick out at the bottom", async () => {
    stubRect(rectOf({ bottom: window.innerHeight, height: 300 }));
    const result = await setup();
    await openPopover(result);
    expect((document.querySelector(".color-popover") as HTMLElement).style.top).toBe(
      `${window.innerHeight - 8 - 300}px`,
    );
  });

  it("never moves above the top margin", async () => {
    stubRect(rectOf({ bottom: window.innerHeight, height: 5000 }));
    const result = await setup();
    await openPopover(result);
    expect((document.querySelector(".color-popover") as HTMLElement).style.top).toBe("8px");
  });

  it("swallows a failing load of the own colours", async () => {
    const result = await setup();
    result.loadCustomColors.mockRejectedValue(new Error("offline"));
    await openPopover(result);
    expect(document.querySelector(".color-popover")).not.toBeNull();
    expect(libState(result.store).colorField.customColors).toEqual([]);
  });

  it("closes on a click outside but not inside or on the swatch", async () => {
    const result = await setup();
    await openPopover(result);
    fireEvent.pointerDown(document.querySelector(".color-presets") as HTMLElement);
    fireEvent.pointerDown(document.querySelector(".color-swatch") as HTMLElement);
    expect(document.querySelector(".color-popover")).not.toBeNull();
    fireEvent.pointerDown(document.body);
    expect(document.querySelector(".color-popover")).toBeNull();
  });

  it("closes on Escape, hands the focus back and keeps the event from outer dialogs", async () => {
    const outer = vi.fn();
    document.addEventListener("keydown", outer);
    const result = await setup();
    await openPopover(result);
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(document.querySelector(".color-popover")).not.toBeNull();
    fireEvent.keyDown(document.body, { key: "Escape" });
    document.removeEventListener("keydown", outer);
    expect(document.querySelector(".color-popover")).toBeNull();
    expect(document.querySelector(".color-swatch")).toHaveFocus();
    expect(outer).not.toHaveBeenCalledWith(expect.objectContaining({ key: "Escape" }));
  });

  it("does not turn a click on plain areas into a native click", async () => {
    const result = await setup();
    await openPopover(result);
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    (document.querySelector(".color-presets") as HTMLElement).dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
  });
});

describe("ColorField choosing", () => {
  it("offers the presets and marks the current colour", async () => {
    const result = await setup({ value: "#FF0000" });
    await openPopover(result);
    expect(document.querySelectorAll(".color-presets .color-preset")).toHaveLength(70);
    expect(document.querySelectorAll(".color-presets .color-preset.on").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "#ff0000", pressed: undefined })).toBeDefined();
  });

  it("reports a clicked preset in lower case and shows it in the hex field", async () => {
    const result = await setup();
    await openPopover(result);
    fireEvent.click(screen.getAllByRole("button", { name: "#00b050" })[0] as HTMLElement);
    expect(result.onChange).toHaveBeenCalledWith("#00b050");
    expect(hexInput().value).toBe("#00b050");
  });

  it("chooses an own colour and marks the current one", async () => {
    const result = await setup({ custom: ["#ff0000", "#112233"] });
    await openPopover(result);
    const items = [...document.querySelectorAll(".color-custom-item .color-preset")];
    expect(items.map((item) => item.classList.contains("on"))).toEqual([true, false]);
    fireEvent.click(screen.getByRole("button", { name: "Eigene Farbe #112233" }));
    expect(result.onChange).toHaveBeenCalledWith("#112233");
  });

  it("accepts a hex value with and without the hash", async () => {
    const result = await setup();
    await openPopover(result);
    fireEvent.change(hexInput(), { target: { value: "00ff00" } });
    expect(result.onChange).toHaveBeenLastCalledWith("#00ff00");
    expect(hexInput().value).toBe("#00ff00");
    fireEvent.change(hexInput(), { target: { value: "#0000FF" } });
    expect(result.onChange).toHaveBeenLastCalledWith("#0000ff");
  });

  it("waits with an invalid hex value and marks it", async () => {
    const result = await setup();
    await openPopover(result);
    fireEvent.change(hexInput(), { target: { value: "#12" } });
    expect(result.onChange).not.toHaveBeenCalled();
    expect(hexInput()).toHaveAttribute("aria-invalid", "true");
    expect((document.querySelector(".color-preview") as HTMLElement).style.background).toBe("rgb(255, 0, 0)");
  });

  it("follows a changed value from outside", async () => {
    const result = await setup();
    await openPopover(result);
    result.rerender(
      <ColorField
        value="#0000FF"
        onChange={result.onChange}
      />,
    );
    expect(hexInput().value).toBe("#0000FF");
    expect(hexInput()).toHaveAttribute("aria-invalid", "false");
  });
});

describe("ColorField mixer", () => {
  const area = () => document.querySelector(".color-area") as HTMLElement;
  const hue = () => document.querySelector(".color-hue") as HTMLElement;

  const openMixer = async (value = "#ff0000") => {
    const result = await setup({ value });
    await openPopover(result);
    fireEvent.click(screen.getByRole("button", { name: "Eigene Farbe mischen" }));
    stubRect();
    return result;
  };

  it("toggles the mixer with the plus button", async () => {
    const result = await setup();
    await openPopover(result);
    const plus = screen.getByRole("button", { name: "Eigene Farbe mischen" });
    expect(document.querySelector(".color-mixer")).toBeNull();
    fireEvent.click(plus);
    expect(document.querySelector(".color-mixer")).not.toBeNull();
    expect(plus).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(plus);
    expect(document.querySelector(".color-mixer")).toBeNull();
  });

  it("picks saturation and brightness in the area and reports on release only", async () => {
    const { onChange } = await openMixer();
    fireEvent.pointerDown(area(), { clientX: 50, clientY: 25, pointerId: 1 });
    const expected = hsvToHex([0, 0.5, 0.75]);
    expect(hexInput().value).toBe(expected);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.pointerUp(area(), { clientX: 100, clientY: 0, pointerId: 1 });
    expect(onChange).toHaveBeenCalledWith("#ff0000");
  });

  it("follows the pointer only while it is captured", async () => {
    const { onChange } = await openMixer();
    fireEvent.pointerMove(area(), { clientX: 50, clientY: 50, pointerId: 1 });
    expect(hexInput().value).toBe("#ff0000");
    vi.spyOn(Element.prototype, "hasPointerCapture").mockReturnValue(true);
    fireEvent.pointerMove(area(), { clientX: 0, clientY: 0, pointerId: 1 });
    expect(hexInput().value).toBe("#ffffff");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("picks the hue with the slider", async () => {
    const { onChange } = await openMixer();
    fireEvent.pointerDown(hue(), { clientX: 100 / 3, clientY: 0, pointerId: 1 });
    expect(hexInput().value).toBe("#00ff00");
    fireEvent.pointerUp(hue(), { clientX: 200 / 3, clientY: 0, pointerId: 1 });
    expect(onChange).toHaveBeenCalledWith("#0000ff");
  });

  it("clamps a pointer outside of the area", async () => {
    await openMixer();
    fireEvent.pointerDown(area(), { clientX: -50, clientY: 500, pointerId: 1 });
    expect(hexInput().value).toBe("#000000");
  });
});

describe("ColorField own colours", () => {
  it("saves the current colour first in the list and shows the stored result", async () => {
    const result = await setup({ custom: ["#112233"] });
    await openPopover(result);
    fireEvent.click(screen.getByRole("button", { name: "Speichern" }));
    expect(result.saveCustomColors).toHaveBeenCalledWith(["#ff0000", "#112233"]);
    await waitFor(() =>
      expect(libState(result.store).colorField.customColors).toEqual(["#ff0000", "#112233"]),
    );
  });

  it("cannot save a colour twice", async () => {
    const result = await setup({ custom: ["#ff0000"] });
    await openPopover(result);
    expect(screen.getByRole("button", { name: "Speichern" })).toBeDisabled();
  });

  it("removes an own colour", async () => {
    const result = await setup({ custom: ["#112233", "#445566"] });
    await openPopover(result);
    fireEvent.click(screen.getByRole("button", { name: "#112233 entfernen" }));
    expect(result.saveCustomColors).toHaveBeenCalledWith(["#445566"]);
    await waitFor(() =>
      expect(libState(result.store).colorField.customColors).toEqual(["#445566"]),
    );
  });

  it("keeps the list when saving fails", async () => {
    const result = await setup({ custom: ["#112233"] });
    result.saveCustomColors.mockRejectedValue(new Error("disk full"));
    await openPopover(result);
    fireEvent.click(screen.getByRole("button", { name: "Speichern" }));
    await waitFor(() => expect(result.saveCustomColors).toHaveBeenCalled());
    await act(async () => undefined);
    expect(libState(result.store).colorField.customColors).toEqual(["#112233"]);
  });

  it("shows own colours already in the state", async () => {
    const store = createTestStore();
    store.dispatch(customColorsSet(["#abcdef"]));
    const result = await setup({ store, custom: ["#abcdef"] });
    await openPopover(result);
    expect(screen.getByTitle("#abcdef")).toBeInTheDocument();
  });
});
