import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DateField, formatDate, parseDate } from "../DateField.js";

const year = new Date().getFullYear();

const setup = (initial = "") => {
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
      />
    );
  }
  render(<Host />);
  return { onChange, input: document.getElementById("date") as HTMLInputElement };
};

describe("formatDate / parseDate", () => {
  it("round-trips real dates and rejects the rest", () => {
    expect(formatDate("2026-03-07")).toBe("07.03.2026");
    expect(formatDate("x")).toBe("");
    expect(parseDate("7.3.2026")).toBe("2026-03-07");
    expect(parseDate("31.02.2026")).toBe("");
    expect(parseDate("nope")).toBe("");
  });
});

describe("DateField typing", () => {
  it("formats digits typed into the input with dots", async () => {
    const { input } = setup();
    await userEvent.type(input, "9102026");
    expect(input).toHaveValue("09.10.2026");
  });

  it("reports the value once the date is complete and valid", async () => {
    const { input, onChange } = setup();
    await userEvent.type(input, "9102026");
    expect(onChange).toHaveBeenLastCalledWith("2026-10-09");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("does not report an incomplete date", async () => {
    const { input, onChange } = setup();
    await userEvent.type(input, "0101");
    expect(input).toHaveValue("01.01.");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("lets backspace remove a trailing dot", async () => {
    const { input } = setup();
    await userEvent.type(input, "01");
    expect(input).toHaveValue("01.");
    await userEvent.type(input, "{Backspace}");
    expect(input).toHaveValue("01");
    await userEvent.type(input, "{Backspace}");
    expect(input).toHaveValue("0");
  });

  it("is not invalid while the text is partial", async () => {
    const { input } = setup();
    await userEvent.type(input, "01");
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("is invalid for a full impossible date and reverts on blur", async () => {
    const { input, onChange } = setup("2026-05-05");
    await userEvent.clear(input);
    await userEvent.type(input, "31022026");
    expect(input).toHaveValue("31.02.2026");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.tab();
    expect(input).toHaveValue("05.05.2026");
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("commits a missing year as the current year on blur", async () => {
    const { input, onChange } = setup();
    await userEvent.type(input, "0101");
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(`${year}-01-01`);
    expect(input).toHaveValue(`01.01.${year}`);
  });

  it("does not report again on blur when the value is unchanged", async () => {
    const { input, onChange } = setup("2026-01-01");
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("01.01.2026");
  });

  it("clears the value when the text is emptied and blurred", async () => {
    const { input, onChange } = setup("2026-01-01");
    await userEvent.clear(input);
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(input).toHaveValue("");
  });

  it("leaves an already empty field alone on blur", async () => {
    const { input, onChange } = setup();
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reverts to the stored value on blur for unusable text", async () => {
    const { input, onChange } = setup("2026-01-01");
    await userEvent.clear(input);
    await userEvent.type(input, "15");
    await userEvent.tab();
    expect(input).toHaveValue("01.01.2026");
    expect(onChange).not.toHaveBeenCalled();
  });
});
