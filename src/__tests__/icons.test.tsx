import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CheckIcon, CloseIcon, EditIcon, PlusIcon, SwapIcon, TrashIcon } from "../index.js";

describe("icons", () => {
  it.each([
    ["TrashIcon", TrashIcon],
    ["CheckIcon", CheckIcon],
    ["PlusIcon", PlusIcon],
    ["EditIcon", EditIcon],
    ["SwapIcon", SwapIcon],
    ["CloseIcon", CloseIcon],
  ])("%s is a decorative 16px stroke icon", (_name, Icon) => {
    const { container } = render(<Icon />);
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg).toHaveAttribute("viewBox", "0 0 16 16");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg.querySelectorAll("path")).toHaveLength(1);
  });
});
