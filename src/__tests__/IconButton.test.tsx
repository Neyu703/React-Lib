import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IconButton, type IconName } from "../index.js";

const ICONS: IconName[] = ["edit", "trash", "save", "close", "plus", "swap", "refresh", "exit"];

describe("IconButton", () => {
  it.each(ICONS)("draws the %s icon as one svg path", (icon) => {
    render(
      <IconButton
        icon={icon}
        label="Aktion"
      />,
    );
    const button = screen.getByRole("button", { name: "Aktion" });
    expect(button.querySelector("svg path")?.getAttribute("d")).toMatch(/^M/);
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("uses distinct paths per icon", () => {
    const paths = ICONS.map((icon) => {
      const { container, unmount } = render(
        <IconButton
          icon={icon}
          label="x"
        />,
      );
      const d = container.querySelector("path")?.getAttribute("d");
      unmount();
      return d;
    });
    expect(new Set(paths).size).toBe(ICONS.length);
  });

  it("uses the label as accessible name and tooltip", () => {
    render(
      <IconButton
        icon="edit"
        label="Bearbeiten"
      />,
    );
    const button = screen.getByRole("button", { name: "Bearbeiten" });
    expect(button).toHaveAttribute("title", "Bearbeiten");
    expect(button).toHaveClass("icon-button");
  });

  it("is type=button by default and passes type=submit through", () => {
    const view = render(
      <IconButton
        icon="plus"
        label="A"
      />,
    );
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    view.unmount();
    render(
      <IconButton
        icon="plus"
        label="A"
        type="submit"
      />,
    );
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("merges className after icon-button", () => {
    render(
      <IconButton
        icon="trash"
        label="L"
        className="danger"
      />,
    );
    expect(screen.getByRole("button").className).toBe("icon-button danger");
  });

  it("passes onClick, disabled and id through", async () => {
    const onClick = vi.fn();
    const view = render(
      <IconButton
        icon="save"
        label="S"
        id="save-1"
        onClick={onClick}
      />,
    );
    expect(screen.getByRole("button")).toHaveAttribute("id", "save-1");
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    view.unmount();
    render(
      <IconButton
        icon="save"
        label="S"
        disabled
        onClick={onClick}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("IconButton with text", () => {
  it("shows the text next to the icon and keeps label as accessible name", () => {
    render(
      <IconButton
        icon="refresh"
        label="Neu laden"
        text="Aktualisieren"
      />,
    );
    const button = screen.getByRole("button", { name: "Neu laden" });
    expect(button).toHaveClass("icon-button", "icon-button-text");
    expect(button).toHaveTextContent("Aktualisieren");
    expect(button.querySelector("svg")).not.toBeNull();
  });

  it("renders no text node without text", () => {
    render(
      <IconButton
        icon="exit"
        label="Beenden"
      />,
    );
    const button = screen.getByRole("button");
    expect(button).not.toHaveClass("icon-button-text");
    expect(button.querySelector("span")).toBeNull();
  });
});
