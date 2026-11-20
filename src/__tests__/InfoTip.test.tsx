import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InfoTip } from "../index.js";

describe("InfoTip", () => {
  it("shows its content as tooltip inside an Info marker", () => {
    const { container } = render(<InfoTip>Hilfetext</InfoTip>);
    expect(container.querySelector(".info-tip")).toHaveAttribute("aria-label", "Info");
    expect(screen.getByRole("tooltip")).toHaveTextContent("Hilfetext");
  });
});
