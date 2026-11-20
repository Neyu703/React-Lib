import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PreviewSelect } from "../PreviewSelect.js";

type Option = { value: string; label: string };
const OPTIONS: Option[] = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

const setup = (value = "b", options: Option[] = OPTIONS) => {
  const onChange = vi.fn<(value: string) => void>();
  const onPreview = vi.fn<(value: string | null) => void>();
  const ui = (nextOptions: Option[], nextValue: string) => (
    <div>
      <PreviewSelect
        id="sel"
        label="Filter"
        value={nextValue}
        options={nextOptions}
        onChange={onChange}
        onPreview={onPreview}
      />
      <button type="button">elsewhere</button>
    </div>
  );
  const view = render(ui(options, value));
  return {
    onChange,
    onPreview,
    view,
    rerenderWith: (nextOptions: Option[], nextValue = value) =>
      view.rerender(ui(nextOptions, nextValue)),
    trigger: screen.getByRole("combobox", { name: "Filter" }),
  };
};
const listbox = (): HTMLElement | null => screen.queryByRole("listbox");
const options = (): HTMLElement[] => screen.queryAllByRole("option");
const elsewhere = (): HTMLElement => screen.getByRole("button", { name: "elsewhere" });

describe("PreviewSelect", () => {
  it("shows the label of the selected option, closed", () => {
    setup("b");
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(listbox()).toBeNull();
  });

  it("falls back to 'Alle' for an unknown value", () => {
    setup("zzz");
    expect(screen.getByText("Alle")).toBeInTheDocument();
  });

  it("opens on click, previews the selected option and exposes aria state", async () => {
    const { trigger, onPreview } = setup("b");
    await userEvent.click(trigger);
    expect(listbox()).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", "sel-options");
    expect(trigger).toHaveAttribute("aria-activedescendant", "sel-option-1");
    expect(onPreview).toHaveBeenLastCalledWith("b");
    expect(options().map((option) => option.getAttribute("aria-selected"))).toEqual([
      "false",
      "true",
      "false",
    ]);
    expect(options()[1]).toHaveClass("preview-active");
  });

  it("closes on a second click and clears the preview", async () => {
    const { trigger, onPreview } = setup();
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    expect(listbox()).toBeNull();
    expect(trigger).not.toHaveAttribute("aria-activedescendant");
    expect(onPreview).toHaveBeenLastCalledWith(null);
  });

  it("previews on hover and clears when the mouse leaves", async () => {
    const { trigger, onPreview } = setup();
    await userEvent.click(trigger);
    await userEvent.hover(options()[2] as HTMLElement);
    expect(onPreview).toHaveBeenLastCalledWith("c");
    expect(options()[2]).toHaveClass("preview-active");
    fireEvent.mouseLeave(trigger.parentElement as HTMLElement);
    expect(onPreview).toHaveBeenLastCalledWith(null);
    expect(options()[2]).not.toHaveClass("preview-active");
  });

  it("picks an option by click, reports it, closes and refocuses the trigger", async () => {
    const { trigger, onChange, onPreview } = setup();
    await userEvent.click(trigger);
    await userEvent.click(options()[0] as HTMLElement);
    expect(onChange).toHaveBeenCalledWith("a");
    expect(listbox()).toBeNull();
    expect(onPreview).toHaveBeenLastCalledWith(null);
    expect(trigger).toHaveFocus();
  });

  it("prevents the mousedown default on an option so the trigger keeps focus", async () => {
    const { trigger } = setup();
    await userEvent.click(trigger);
    expect(fireEvent.mouseDown(options()[0] as HTMLElement)).toBe(false);
  });

  it("marks only the selected option with a check icon", async () => {
    const { trigger } = setup("b");
    await userEvent.click(trigger);
    expect(options().map((option) => option.querySelector("svg") !== null)).toEqual([
      false,
      true,
      false,
    ]);
  });

  describe("keyboard", () => {
    it.each([
      ["ArrowDown", "b"],
      ["ArrowUp", "b"],
      ["Home", "a"],
      ["End", "c"],
    ])("%s on the closed trigger opens and previews the matching option", (key, expected) => {
      const { trigger, onPreview } = setup("b");
      fireEvent.keyDown(trigger, { key });
      expect(listbox()).toBeInTheDocument();
      expect(onPreview).toHaveBeenLastCalledWith(expected);
    });

    it("starts at the first option when nothing is selected", () => {
      const { trigger, onPreview } = setup("zzz");
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      expect(onPreview).toHaveBeenLastCalledWith("a");
    });

    it("moves down and up through the open list, wrapping around", () => {
      const { trigger, onPreview } = setup("a");
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      expect(onPreview).toHaveBeenLastCalledWith("b");
      fireEvent.keyDown(trigger, { key: "ArrowUp" });
      fireEvent.keyDown(trigger, { key: "ArrowUp" });
      expect(onPreview).toHaveBeenLastCalledWith("c");
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      expect(onPreview).toHaveBeenLastCalledWith("a");
      expect(trigger).toHaveAttribute("aria-activedescendant", "sel-option-0");
    });

    it("moves with Home/End inside the open list", () => {
      const { trigger, onPreview } = setup("b");
      fireEvent.keyDown(trigger, { key: "End" });
      expect(onPreview).toHaveBeenLastCalledWith("c");
      fireEvent.keyDown(trigger, { key: "Home" });
      expect(onPreview).toHaveBeenLastCalledWith("a");
    });

    it("scrolls the active option into view when the browser supports it", () => {
      const scrollIntoView = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoView;
      try {
        const { trigger } = setup("b");
        fireEvent.keyDown(trigger, { key: "ArrowDown" });
        expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
      } finally {
        delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
      }
    });

    it("prevents the default but does nothing for arrows on an empty list", () => {
      const { trigger } = setup("x", []);
      expect(fireEvent.keyDown(trigger, { key: "ArrowDown" })).toBe(false);
      expect(listbox()).toBeNull();
    });

    it.each(["Enter", " "])("%j opens the closed list and then picks the active option", (key) => {
      const { trigger, onChange } = setup("b");
      fireEvent.keyDown(trigger, { key });
      expect(listbox()).toBeInTheDocument();
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      fireEvent.keyDown(trigger, { key });
      expect(onChange).toHaveBeenCalledWith("c");
      expect(listbox()).toBeNull();
    });

    it("Enter on an open list without an active option previews the selected one instead of picking", () => {
      const { trigger, onChange, onPreview } = setup("b");
      fireEvent.click(trigger);
      fireEvent.mouseLeave(trigger.parentElement as HTMLElement); // active = -1
      fireEvent.keyDown(trigger, { key: "Enter" });
      expect(onChange).not.toHaveBeenCalled();
      expect(onPreview).toHaveBeenLastCalledWith("b");
    });

    it("Escape closes an open list and is swallowed", () => {
      const { trigger, onPreview } = setup();
      fireEvent.click(trigger);
      expect(fireEvent.keyDown(trigger, { key: "Escape" })).toBe(false);
      expect(listbox()).toBeNull();
      expect(onPreview).toHaveBeenLastCalledWith(null);
    });

    it("Escape on a closed list is left to the caller", () => {
      const { trigger } = setup();
      expect(fireEvent.keyDown(trigger, { key: "Escape" })).toBe(true);
    });

    it("Tab closes the list without preventing the default", () => {
      const { trigger } = setup();
      fireEvent.click(trigger);
      expect(fireEvent.keyDown(trigger, { key: "Tab" })).toBe(true);
      expect(listbox()).toBeNull();
    });

    it("ignores other keys", () => {
      const { trigger } = setup();
      expect(fireEvent.keyDown(trigger, { key: "x" })).toBe(true);
      expect(listbox()).toBeNull();
    });
  });

  describe("closing", () => {
    it("closes on a press outside, but not inside", async () => {
      const { trigger, onPreview } = setup();
      await userEvent.click(trigger);
      fireEvent.pointerDown(options()[0] as HTMLElement);
      expect(listbox()).toBeInTheDocument();
      fireEvent.pointerDown(elsewhere());
      expect(listbox()).toBeNull();
      expect(onPreview).toHaveBeenLastCalledWith(null);
    });

    it("closes when focus leaves, but not when it moves inside", async () => {
      const { trigger } = setup();
      await userEvent.click(trigger);
      fireEvent.blur(trigger, { relatedTarget: options()[0] });
      expect(listbox()).toBeInTheDocument();
      fireEvent.blur(trigger, { relatedTarget: elsewhere() });
      expect(listbox()).toBeNull();
    });

    it("closes when focus leaves to nowhere", async () => {
      const { trigger } = setup();
      await userEvent.click(trigger);
      fireEvent.blur(trigger, { relatedTarget: null });
      expect(listbox()).toBeNull();
    });

    it("clears the preview on unmount", () => {
      const { onPreview, view } = setup();
      onPreview.mockClear();
      view.unmount();
      expect(onPreview).toHaveBeenCalledWith(null);
    });
  });

  describe("options that change while open", () => {
    it("clicking with no options previews nothing", () => {
      const { trigger, onPreview } = setup("x", []);
      fireEvent.click(trigger);
      expect(onPreview).toHaveBeenLastCalledWith(null);
    });

    it("Enter on an active option that vanished picks nothing", () => {
      const { trigger, rerenderWith, onChange } = setup("c");
      fireEvent.keyDown(trigger, { key: "ArrowDown" }); // active = 2
      rerenderWith([OPTIONS[0] as Option], "a");
      fireEvent.keyDown(trigger, { key: "Enter" });
      expect(onChange).not.toHaveBeenCalled();
      expect(listbox()).toBeInTheDocument();
    });
  });
});
