import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DialogFrame } from "../../../modules/dialogs/DialogFrame.js";

describe("DialogFrame as a form", () => {
  const open = (props: Partial<React.ComponentProps<typeof DialogFrame>> = {}) => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const view = render(
      <DialogFrame
        id="frame"
        title="Titel"
        titleId="frame-title"
        onSubmit={onSubmit}
        actions={<button type="submit">OK</button>}
        {...props}
      >
        <p>Inhalt</p>
      </DialogFrame>,
    );
    return { onSubmit, form: view.container.querySelector("form") as HTMLFormElement };
  };

  it("renders head, content and footer inside a dialog-frame form", () => {
    const { form } = open();
    expect(form).toHaveClass("dialog-frame");
    expect(form).toHaveAttribute("id", "frame");
    expect(form).toHaveAttribute("autocomplete", "off");
    expect(form).toHaveAttribute("method", "dialog");
    expect(screen.getByRole("heading", { level: 2, name: "Titel" })).toHaveAttribute(
      "id",
      "frame-title",
    );
    expect(form.querySelector(".dialog-head h2")).not.toBeNull();
    expect(form.querySelector(".dialog-content")).toHaveTextContent("Inhalt");
    expect(form.querySelector(".dialog-foot")).toHaveClass("dialog-actions");
    expect(form.querySelector(".dialog-foot")).toContainElement(
      screen.getByRole("button", { name: "OK" }),
    );
  });

  it("calls onSubmit when submitted", () => {
    const { onSubmit, form } = open();
    fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("sets noValidate only when asked", () => {
    expect(open({ noValidate: true }).form.noValidate).toBe(true);
  });

  it("validates by default", () => {
    expect(open().form.noValidate).toBe(false);
  });

  it("accepts a node as title and an extra footer class", () => {
    const { form } = open({
      title: (
        <>
          Neu <em>jetzt</em>
        </>
      ),
      actionsClassName: "changelog-actions",
    });
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Neu jetzt");
    expect(form.querySelector(".dialog-foot")).toHaveClass("dialog-actions", "changelog-actions");
  });

  it("works without ids", () => {
    const { form } = open({ id: undefined, titleId: undefined });
    expect(form).not.toHaveAttribute("id");
    expect(screen.getByRole("heading", { level: 2 })).not.toHaveAttribute("id");
  });
});

describe("DialogFrame as a plain container", () => {
  it("renders a div without form semantics and without submit", () => {
    const { container } = render(
      <DialogFrame
        id="plain"
        title="Läuft"
        actions={<button type="button">Stop</button>}
      >
        <p>Fortschritt</p>
      </DialogFrame>,
    );
    const frame = container.firstElementChild as HTMLElement;
    expect(frame.tagName).toBe("DIV");
    expect(frame).toHaveClass("dialog-frame");
    expect(frame).toHaveAttribute("id", "plain");
    expect(container.querySelector("form")).toBeNull();
    expect(screen.queryByRole("form")).toBeNull();
    expect(screen.getByRole("heading", { name: "Läuft" })).toBeInTheDocument();
    expect(frame.querySelector(".dialog-foot")).toHaveTextContent("Stop");
    expect(frame.querySelector(".dialog-foot")?.className).toBe("dialog-actions dialog-foot");
  });
});
