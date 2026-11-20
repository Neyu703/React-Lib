import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Float, Select } from "../index.js";

const OPTIONS: [string, string][] = [
  ["a", "Alpha"],
  ["b", "Beta"],
];

describe("Select", () => {
  it("shows the options, the value and the label as accessible name", () => {
    render(
      <Select
        id="sel"
        label="Wahl"
        value="b"
        onChange={() => undefined}
        options={OPTIONS}
      />,
    );
    const select = screen.getByRole("combobox", { name: "Wahl" });
    expect(select).toHaveValue("b");
    expect(select).toHaveAttribute("id", "sel");
    expect(select).toHaveClass("select");
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Alpha", "Beta"]);
  });

  it("reports the picked value", async () => {
    const onChange = vi.fn();
    render(
      <Select
        id="sel"
        label="Wahl"
        value="a"
        onChange={onChange}
        options={OPTIONS}
        className="wide"
      />,
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "b");
    expect(onChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("combobox")).toHaveClass("select", "wide");
  });

  it("can be disabled and sits inside Float", () => {
    render(
      <Float label="Wahl">
        <Select
          id="sel"
          label="Wahl"
          value="a"
          onChange={() => undefined}
          options={OPTIONS}
          disabled
        />
      </Float>,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(document.querySelector("label.float > select.select")).not.toBeNull();
  });
});
