import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusPill } from "../index.js";

describe("StatusPill", () => {
  it.each(["ok", "warn", "fail", "neutral"] as const)("renders the %s tone", (tone) => {
    render(<StatusPill tone={tone}>Text</StatusPill>);
    const pill = screen.getByText("Text");
    expect(pill.className).toBe(`status-pill status-pill-${tone}`);
    expect(pill).not.toHaveAttribute("role");
  });

  it("is a live status region only on request and merges className", () => {
    render(
      <StatusPill
        tone="ok"
        live
        className="big"
      >
        Bereit
      </StatusPill>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Bereit");
    expect(screen.getByRole("status")).toHaveClass("big");
  });
});
