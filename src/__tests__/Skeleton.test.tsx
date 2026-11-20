import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Ghost, Loading, Skeleton, SkeletonGrid, SkeletonLines } from "../index.js";

describe("Skeleton", () => {
  it("is a decorative block sized like the content", () => {
    const { container } = render(
      <Skeleton
        width={60}
        height="2em"
        radius={8}
      />,
    );
    const block = container.querySelector(".skeleton") as HTMLElement;
    expect(block).toHaveAttribute("aria-hidden", "true");
    expect(block.style.width).toBe("60px");
    expect(block.style.height).toBe("2em");
    expect(block.style.borderRadius).toBe("8px");
  });

  it("appends a custom class and merges the style last", () => {
    const { container } = render(
      <Skeleton
        width={10}
        className="wide"
        style={{ width: 99, opacity: 0.5 }}
      />,
    );
    const block = container.querySelector(".skeleton") as HTMLElement;
    expect(block.className).toBe("skeleton wide");
    expect(block.style.width).toBe("99px");
    expect(block.style.opacity).toBe("0.5");
  });

  it("makes a circle as high as it is wide", () => {
    const { container } = render(
      <Skeleton
        circle
        width={24}
      />,
    );
    const block = container.querySelector(".skeleton") as HTMLElement;
    expect(block).toHaveClass("skeleton-circle");
    expect(block.style.height).toBe("24px");
  });

  it("draws lines with a shorter last one", () => {
    const { container } = render(
      <SkeletonLines
        lines={3}
        lastWidth="40%"
      />,
    );
    const widths = [...container.querySelectorAll<HTMLElement>(".skeleton")].map(
      (block) => block.style.width,
    );
    expect(widths).toEqual(["100%", "100%", "40%"]);
  });

  it("draws a grid of rows times columns", () => {
    const { container } = render(
      <SkeletonGrid
        rows={2}
        columns={3}
      />,
    );
    expect(container.querySelectorAll(".skeleton")).toHaveLength(6);
    expect(
      (container.querySelector(".skeleton-grid") as HTMLElement).style.gridTemplateColumns,
    ).toBe("repeat(3, minmax(0, 1fr))");
  });
});

describe("Loading", () => {
  it("announces itself as busy and shows the fallback while loading", () => {
    render(
      <Loading
        loading
        label="Plan lädt …"
        fallback={<SkeletonGrid rows={1} />}
      >
        <p>fertig</p>
      </Loading>,
    );
    const region = screen.getByRole("status", { name: "Plan lädt …" });
    expect(region).toHaveAttribute("aria-busy", "true");
    expect(region.querySelectorAll(".skeleton")).toHaveLength(1);
    expect(screen.queryByText("fertig")).toBeNull();
  });

  it("falls back to three lines and a default label", () => {
    render(<Loading loading />);
    expect(
      screen.getByRole("status", { name: "Lädt …" }).querySelectorAll(".skeleton"),
    ).toHaveLength(3);
  });

  it("shows the children and no placeholder once loaded", () => {
    render(
      <Loading loading={false}>
        <p>fertig</p>
      </Loading>,
    );
    expect(screen.getByText("fertig")).toBeInTheDocument();
    expect(screen.queryByRole("status")).toBeNull();
  });
});

describe("Ghost", () => {
  it("keeps the real layout but hides and disables it, announced as busy", () => {
    const { container } = render(
      <Ghost label="Plan lädt …">
        <button type="button">Speichern</button>
      </Ghost>,
    );
    const region = screen.getByRole("status", { name: "Plan lädt …" });
    expect(region).toHaveAttribute("aria-busy", "true");
    const content = container.querySelector(".ghost-content") as HTMLElement;
    expect(content).toHaveAttribute("aria-hidden", "true");
    expect(content).toHaveAttribute("inert");
    expect(content).toHaveTextContent("Speichern");
  });
});
