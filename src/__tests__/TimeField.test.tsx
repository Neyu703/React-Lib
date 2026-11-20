import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { TimeField } from "../TimeField.js";

const ITEM = 36;

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

type Props = Partial<Parameters<typeof TimeField>[0]>;
const setup = (initial = "", props: Props = {}) => {
  const onChange = vi.fn<(value: string) => void>();
  function Host() {
    const [value, setValue] = useState(initial);
    return (
      <TimeField
        name="start"
        value={value}
        onChange={(next) => {
          onChange(next);
          setValue(next);
        }}
        {...props}
      />
    );
  }
  render(<Host />);
  return { onChange, input: document.querySelector("input") as HTMLInputElement };
};
const toggle = (): HTMLElement => screen.getByRole("button", { name: "Uhrzeit wählen" });
const popover = (): HTMLElement | null => screen.queryByRole("dialog", { name: "Uhrzeit wählen" });
const wheel = (label: string): HTMLElement => screen.getByRole("spinbutton", { name: label });
/** Scrolls a wheel to a number in the middle copy and lets it settle. */
const spinTo = (label: string, count: number, number: number): void => {
  const element = wheel(label);
  element.scrollTop = (2 * count + number) * ITEM;
  fireEvent.scroll(element);
  act(() => {
    vi.advanceTimersByTime(120);
  });
};

describe("TimeField input", () => {
  it("is a read-only text input carrying name, required and the value", () => {
    const { input } = setup("07:30", { required: true });
    expect(input).toHaveValue("07:30");
    expect(input).toHaveAttribute("name", "start");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("readonly");
    expect(popover()).toBeNull();
  });

  it("opens and closes with the clock button", () => {
    setup("07:30");
    fireEvent.click(toggle());
    expect(popover()).not.toBeNull();
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggle());
    expect(popover()).toBeNull();
  });

  it("opens on a click into the input", () => {
    const { input } = setup("07:30");
    fireEvent.click(input);
    expect(popover()).not.toBeNull();
  });

  it.each(["Enter", " ", "ArrowDown"])("%j opens the popover and prevents the default", (key) => {
    const { input } = setup("07:30");
    expect(fireEvent.keyDown(input, { key })).toBe(false);
    expect(popover()).not.toBeNull();
    // while open the key neither toggles it closed
    expect(fireEvent.keyDown(input, { key })).toBe(false);
    expect(popover()).not.toBeNull();
  });

  it("ignores other keys", () => {
    const { input } = setup("07:30");
    expect(fireEvent.keyDown(input, { key: "x" })).toBe(true);
    expect(popover()).toBeNull();
  });
});

describe("TimeField popover", () => {
  it("opens the wheels on the current value", () => {
    setup("07:30");
    fireEvent.click(toggle());
    expect(wheel("Stunde")).toHaveAttribute("aria-valuenow", "7");
    expect(wheel("Minute")).toHaveAttribute("aria-valuenow", "30");
    expect(wheel("Minute")).toHaveAttribute("aria-valuemax", "59");
  });

  it("opens on 00:00 when the value is empty or not a valid time", () => {
    setup("25:99");
    fireEvent.click(toggle());
    expect(wheel("Stunde")).toHaveAttribute("aria-valuenow", "0");
    expect(wheel("Minute")).toHaveAttribute("aria-valuenow", "0");
  });

  it("reports each wheel selection as a padded HH:MM", () => {
    const { onChange, input } = setup("07:30");
    fireEvent.click(toggle());
    spinTo("Stunde", 24, 9);
    expect(onChange).toHaveBeenLastCalledWith("09:30");
    spinTo("Minute", 60, 5);
    expect(onChange).toHaveBeenLastCalledWith("09:05");
    expect(input).toHaveValue("09:05");
    expect(wheel("Stunde")).toHaveAttribute("aria-valuenow", "9");
  });

  it("does not report when a wheel settles on the number it already shows", () => {
    const { onChange } = setup("07:30");
    fireEvent.click(toggle());
    spinTo("Stunde", 24, 7);
    spinTo("Minute", 60, 30);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("'Fertig' commits the draft and closes (00:00 for an empty field)", () => {
    const { onChange } = setup("");
    fireEvent.click(toggle());
    fireEvent.click(screen.getByRole("button", { name: "Fertig" }));
    expect(onChange).toHaveBeenCalledWith("00:00");
    expect(popover()).toBeNull();
  });

  it("'Löschen' clears the value and closes", () => {
    const { onChange, input } = setup("07:30");
    fireEvent.click(toggle());
    fireEvent.click(screen.getByRole("button", { name: "Löschen" }));
    expect(onChange).toHaveBeenCalledWith("");
    expect(input).toHaveValue("");
    expect(popover()).toBeNull();
  });

  it("has no 'Löschen' when required or empty", () => {
    setup("07:30", { required: true });
    fireEvent.click(toggle());
    expect(screen.queryByRole("button", { name: "Löschen" })).toBeNull();
    fireEvent.click(toggle());
  });

  it("has no 'Löschen' for an empty optional field", () => {
    setup("");
    fireEvent.click(toggle());
    expect(screen.queryByRole("button", { name: "Löschen" })).toBeNull();
  });

  it("swallows clicks inside the popover (no forwarding to a surrounding label)", () => {
    setup("07:30");
    fireEvent.click(toggle());
    expect(fireEvent.click(popover() as HTMLElement)).toBe(false);
  });

  it("closes on an outside press and on Escape, but not on a press inside or another key", () => {
    setup("07:30");
    fireEvent.click(toggle());
    fireEvent.pointerDown(popover() as HTMLElement);
    fireEvent.pointerDown(toggle());
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(popover()).not.toBeNull();
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(popover()).toBeNull();
    fireEvent.click(toggle());
    fireEvent.pointerDown(document.body);
    expect(popover()).toBeNull();
  });
});
