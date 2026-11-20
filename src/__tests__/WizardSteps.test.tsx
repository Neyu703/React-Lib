import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WizardSteps } from "../index.js";

describe("WizardSteps", () => {
  it("marks finished steps done and the current one current", () => {
    render(<WizardSteps id="w" steps={["Eins", "Zwei", "Drei"]} current={1} />);
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.className)).toEqual(["done", "current", ""]);
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[0]).not.toHaveAttribute("aria-current");
    expect(items[2]).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("list")).toHaveAttribute("id", "w");
  });

  it("renders without id and with all steps open before the first", () => {
    render(<WizardSteps steps={["Eins", "Zwei"]} current={-1} />);
    expect(screen.getByRole("list")).not.toHaveAttribute("id");
    expect(screen.getAllByRole("listitem").map((item) => item.className)).toEqual(["", ""]);
  });
});
