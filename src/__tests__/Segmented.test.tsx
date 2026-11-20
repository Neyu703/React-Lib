import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Segmented } from "../index.js";

const OPTIONS: [string, string, string?][] = [
  ["a", "Alpha", "Erste Option"],
  ["b", "Beta"],
];

describe("Segmented", () => {
  it("is a labelled group with count and position of the pressed option", () => {
    render(<Segmented id="seg" label="Auswahl" options={OPTIONS} value="b" onPick={vi.fn()} />);
    const group = screen.getByRole("group", { name: "Auswahl" });
    expect(group).toHaveAttribute("id", "seg");
    expect(group).toHaveAttribute("data-count", "2");
    expect(group).toHaveAttribute("data-at", "1");
  });

  it("marks only the current value as pressed", () => {
    render(<Segmented id="seg" label="A" options={OPTIONS} value="a" onPick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Alpha" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Beta" })).toHaveAttribute("aria-pressed", "false");
  });

  it("hides the thumb (position -1) when no option matches", () => {
    render(<Segmented id="seg" label="A" options={OPTIONS} value="zzz" onPick={vi.fn()} />);
    expect(screen.getByRole("group")).toHaveAttribute("data-at", "-1");
    screen.getAllByRole("button").forEach((button) => expect(button).toHaveAttribute("aria-pressed", "false"));
  });

  it("uses the optional hint as tooltip", () => {
    render(<Segmented id="seg" label="A" options={OPTIONS} value="a" onPick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Alpha" })).toHaveAttribute("title", "Erste Option");
    expect(screen.getByRole("button", { name: "Beta" })).not.toHaveAttribute("title");
  });

  it("reports the picked key and renders type=button", async () => {
    const onPick = vi.fn();
    render(<Segmented id="seg" label="A" options={OPTIONS} value="a" onPick={onPick} />);
    const beta = screen.getByRole("button", { name: "Beta" });
    expect(beta).toHaveAttribute("type", "button");
    await userEvent.click(beta);
    expect(onPick).toHaveBeenCalledExactlyOnceWith("b");
  });
});
