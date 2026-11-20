import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { formatWeek, parseWeek, WeekField } from "../WeekField.js";

type Props = Partial<Parameters<typeof WeekField>[0]>;
const setup = (initial = "", props: Props = {}) => {
  const onChange = vi.fn<(value: string) => void>();
  function Host() {
    const [value, setValue] = useState(initial);
    return (
      <WeekField
        id="week"
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
  return { onChange, input: document.getElementById("week") as HTMLInputElement };
};
const toggle = (): HTMLElement => screen.getByRole("button", { name: "Kalender öffnen" });
const popover = (): HTMLElement | null => screen.queryByRole("dialog", { name: "Woche wählen" });
const day = (label: string): HTMLElement =>
  screen
    .getAllByRole("button", { name: label })
    .find((button) => button.classList.contains("calendar-day")) as HTMLElement;

describe("formatWeek / parseWeek", () => {
  it("formats an ISO week and rejects everything else", () => {
    expect(formatWeek("2026-W07")).toBe("KW 07/2026");
    expect(formatWeek("")).toBe("");
    expect(formatWeek("2026-07")).toBe("");
  });

  it.each([
    ["KW 7/2026", "2026-W07"],
    ["7/2026", "2026-W07"],
    ["07.2026", "2026-W07"],
    ["kw12-2026", "2026-W12"],
    [" KW 53/2026 ", "2026-W53"],
  ])("parses %s", (text, expected) => {
    expect(parseWeek(text)).toBe(expected);
  });

  it.each(["", "abc", "KW 7/26", "0/2026", "00/2026", "54/2026", "53/2025", "7/20266"])(
    "rejects %j",
    (text) => {
      expect(parseWeek(text)).toBe("");
    },
  );
});

describe("WeekField typing", () => {
  it("shows the formatted value", () => {
    expect(setup("2026-W07").input).toHaveValue("KW 07/2026");
  });

  it("is empty without a value", () => {
    expect(setup().input).toHaveValue("");
  });

  it("reports once the 4-digit year is typed, not before", async () => {
    const { input, onChange } = setup();
    await userEvent.type(input, "7/202");
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.type(input, "6");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("2026-W07");
  });

  it("flags a long enough text that is not a week as invalid, not a partial one", () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: "7/20" } });
    expect(input).toHaveAttribute("aria-invalid", "false");
    fireEvent.change(input, { target: { value: "53/2025" } });
    expect(input).toHaveAttribute("aria-invalid", "true");
    fireEvent.change(input, { target: { value: "7/2026" } });
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("blur reverts an invalid text to the current value", () => {
    const { input, onChange } = setup("2026-W07");
    fireEvent.change(input, { target: { value: "murks" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("KW 07/2026");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("blur clears an emptied field once, and does nothing when it was empty already", () => {
    const { input, onChange } = setup("2026-W07");
    fireEvent.change(input, { target: { value: "  " } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith("");
    expect(input).toHaveValue("");
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("blur reformats a valid text the parent already took without reporting it again", () => {
    const { input, onChange } = setup("2026-W07");
    fireEvent.change(input, { target: { value: "8.2026" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    fireEvent.blur(input);
    expect(input).toHaveValue("KW 08/2026");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("blur commits a valid text the parent did not take yet", () => {
    const onChange = vi.fn<(value: string) => void>();
    render(
      <WeekField
        id="frozen"
        value=""
        onChange={onChange}
      />,
    );
    const input = document.getElementById("frozen") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "8/2026" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(input).toHaveValue("KW 08/2026");
  });
});

describe("WeekField popover", () => {
  it("opens with the button and Alt+ArrowDown, closes with the button; plain ArrowDown does nothing", () => {
    const { input } = setup("2026-W07");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(popover()).toBeNull();
    fireEvent.keyDown(input, { key: "ArrowDown", altKey: true });
    expect(popover()).not.toBeNull();
    fireEvent.click(toggle());
    expect(popover()).toBeNull();
    fireEvent.click(toggle());
    expect(popover()).not.toBeNull();
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
  });

  it("marks the selected week and picks the week of a clicked day", async () => {
    const { onChange } = setup("2026-W07");
    await userEvent.click(toggle());
    expect(screen.getByText("Februar 2026")).toBeInTheDocument();
    expect(
      Array.from(document.querySelectorAll(".calendar-day.selected")).map(
        (button) => button.textContent,
      ),
    ).toEqual(["9", "10", "11", "12", "13", "14", "15"]);
    await userEvent.click(day("18"));
    expect(onChange).toHaveBeenCalledWith("2026-W08");
    expect(popover()).toBeNull();
    expect(document.getElementById("week")).toHaveValue("KW 08/2026");
  });

  it("opens on the current month without a value, and 'Diese Woche' picks the current week", async () => {
    const { onChange } = setup("");
    await userEvent.click(toggle());
    await userEvent.click(screen.getByRole("button", { name: "Diese Woche" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toMatch(/^\d{4}-W\d{2}$/);
  });

  it("'Löschen' clears the value", async () => {
    const { onChange, input } = setup("2026-W07");
    await userEvent.click(toggle());
    await userEvent.click(screen.getByRole("button", { name: "Löschen" }));
    expect(onChange).toHaveBeenCalledWith("");
    expect(input).toHaveValue("");
  });

  it("required has no 'Löschen'", async () => {
    setup("2026-W07", { required: true });
    await userEvent.click(toggle());
    expect(screen.queryByRole("button", { name: "Löschen" })).toBeNull();
  });

  it("disables days before the minimum week", async () => {
    setup("2026-W10", { min: "2026-W10" });
    await userEvent.click(toggle());
    expect(day("1")).toBeDisabled(); // Sunday of week 9
    expect(day("2")).toBeEnabled();
  });

  it("works without a minimum (nothing disabled)", async () => {
    setup("2026-W10");
    await userEvent.click(toggle());
    expect(day("1")).toBeEnabled();
  });

  it("closes on an outside press and on Escape, but not on a press inside", async () => {
    setup("2026-W07");
    await userEvent.click(toggle());
    fireEvent.pointerDown(popover() as HTMLElement);
    fireEvent.pointerDown(toggle());
    expect(popover()).not.toBeNull();
    fireEvent.pointerDown(document.body);
    expect(popover()).toBeNull();
    await userEvent.click(toggle());
    fireEvent.keyDown(document.body, { key: "a" });
    expect(popover()).not.toBeNull();
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(popover()).toBeNull();
  });

  it("disabled disables input and button", () => {
    setup("", { disabled: true });
    expect(document.getElementById("week")).toBeDisabled();
    expect(toggle()).toBeDisabled();
  });
});
