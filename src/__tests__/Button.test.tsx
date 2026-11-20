import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../index.js";

describe("Button", () => {
  it("is a secondary, normal-sized type=button by default", () => {
    render(<Button>Speichern</Button>);
    const button = screen.getByRole("button", { name: "Speichern" });
    expect(button).toHaveAttribute("type", "button");
    expect(button.className).toBe("button button-secondary");
  });

  it.each(["primary", "secondary", "danger"] as const)("applies the %s variant", (variant) => {
    render(<Button variant={variant}>X</Button>);
    expect(screen.getByRole("button")).toHaveClass(`button-${variant}`);
  });

  it("applies the small size and merges className last", () => {
    render(
      <Button
        size="small"
        className="wide"
      >
        X
      </Button>,
    );
    expect(screen.getByRole("button").className).toBe("button button-secondary button-small wide");
  });

  it("passes native attributes through", async () => {
    const onClick = vi.fn();
    const view = render(
      <Button
        type="submit"
        onClick={onClick}
      >
        Go
      </Button>,
    );
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
    view.unmount();
    render(
      <Button
        disabled
        onClick={onClick}
      >
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
