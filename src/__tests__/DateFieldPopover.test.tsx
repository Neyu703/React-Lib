import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DateField } from "../DateField.js";

type Props = Partial<Parameters<typeof DateField>[0]>;
const setup = (initial = "", props: Props = {}) => {
  const onChange = vi.fn<(value: string) => void>();
  function Host() {
    const [value, setValue] = useState(initial);
    return (
      <DateField
        id="date"
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
  return { onChange, input: document.getElementById("date") as HTMLInputElement };
};
const toggle = (): HTMLElement => screen.getByRole("button", { name: "Kalender öffnen" });
const popover = (): HTMLElement | null => screen.queryByRole("dialog", { name: "Datum wählen" });
const day = (label: string): HTMLElement =>
  screen
    .getAllByRole("button", { name: label })
    .find((button) => button.classList.contains("calendar-day")) as HTMLElement;

describe("DateField popover", () => {
  it("opens with the button and Alt+ArrowDown, closes with the button; plain ArrowDown does nothing", () => {
    const { input } = setup("2026-02-07");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(popover()).toBeNull();
    fireEvent.keyDown(input, { key: "ArrowDown", altKey: true });
    expect(popover()).not.toBeNull();
    fireEvent.click(toggle());
    expect(popover()).toBeNull();
    fireEvent.click(toggle());
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
  });

  it("picks a clicked day, fills the input and closes", async () => {
    const { onChange, input } = setup("2026-02-07");
    await userEvent.click(toggle());
    expect(screen.getByText("Februar 2026")).toBeInTheDocument();
    await userEvent.click(day("18"));
    expect(onChange).toHaveBeenCalledWith("2026-02-18");
    expect(popover()).toBeNull();
    expect(input).toHaveValue("18.02.2026");
  });

  it("clears with 'Löschen' unless required", async () => {
    const { onChange, input } = setup("2026-02-07");
    await userEvent.click(toggle());
    await userEvent.click(screen.getByRole("button", { name: "Löschen" }));
    expect(onChange).toHaveBeenCalledWith("");
    expect(input).toHaveValue("");
  });

  it("required has no 'Löschen'", async () => {
    setup("2026-02-07", { required: true });
    await userEvent.click(toggle());
    expect(screen.queryByRole("button", { name: "Löschen" })).toBeNull();
  });

  it("disables days before the minimum", async () => {
    setup("2026-02-10", { min: "2026-02-10" });
    await userEvent.click(toggle());
    expect(day("9")).toBeDisabled();
    expect(day("10")).toBeEnabled();
  });

  it("closes on an outside press and on Escape, but not on a press inside", async () => {
    setup("2026-02-07");
    await userEvent.click(toggle());
    fireEvent.pointerDown(popover() as HTMLElement);
    fireEvent.pointerDown(toggle());
    expect(popover()).not.toBeNull();
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(popover()).not.toBeNull();
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(popover()).toBeNull();
    await userEvent.click(toggle());
    fireEvent.pointerDown(document.body);
    expect(popover()).toBeNull();
  });

  it("disables the toggle button when the field is disabled", () => {
    setup("", { disabled: true });
    expect(toggle()).toBeDisabled();
  });
});
