import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Float } from "../index.js";

describe("Float", () => {
  it("wraps the field and puts the label after it", () => {
    const { container } = render(
      <Float label="Name">
        <input placeholder=" " />
      </Float>,
    );
    const label = container.querySelector("label") as HTMLElement;
    expect(label.className).toBe("float");
    expect(label.lastElementChild).toHaveClass("float-label");
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("adds the state classes and the custom class in order", () => {
    const { container } = render(
      <Float label="X" always required missing className="wide" id="f1">
        <select />
      </Float>,
    );
    const label = container.querySelector("label") as HTMLElement;
    expect(label.className).toBe("float always required missing wide");
    expect(label).toHaveAttribute("id", "f1");
  });
});
