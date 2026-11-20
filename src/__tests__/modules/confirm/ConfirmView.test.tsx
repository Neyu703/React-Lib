import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmView } from "../../../modules/confirm/ConfirmView.js";
import { renderWithLibStore } from "../../../testing/index.js";

const open = (preview?: React.ReactNode) => {
  const done = vi.fn();
  renderWithLibStore(
    <ConfirmView
      title="Löschen?"
      text="Wirklich löschen?"
      yesLabel="Ja, löschen"
      preview={preview}
      done={done}
    />,
  );
  return done;
};

describe("ConfirmView", () => {
  it("shows title, text and the confirm button as a fixed modal", () => {
    open();
    expect(screen.getByRole("heading", { name: "Löschen?" })).toBeInTheDocument();
    expect(screen.getByText("Wirklich löschen?")).toHaveAttribute("id", "confirm-text");
    expect(document.getElementById("confirm-dialog")?.dataset.modal).toBe("true");
    expect(document.getElementById("confirm-dialog")).not.toHaveClass("with-preview");
    expect(document.getElementById("confirm-preview")).toBeNull();
  });

  it("answers yes", () => {
    const done = open();
    fireEvent.click(screen.getByRole("button", { name: "Ja, löschen" }));
    expect(done).toHaveBeenCalledWith(true);
  });

  it("answers no on Abbrechen, on the close button and on Escape", () => {
    const done = open();
    fireEvent.click(screen.getByRole("button", { name: "Abbrechen" }));
    fireEvent.click(document.querySelector(".dialog-close") as HTMLElement);
    fireEvent(document.getElementById("confirm-dialog") as HTMLElement, new Event("cancel"));
    expect(done.mock.calls).toEqual([[false], [false], [false]]);
  });

  it("shows a preview and marks the dialog for it", () => {
    open(<em>Vorschau</em>);
    expect(document.getElementById("confirm-preview")).toHaveTextContent("Vorschau");
    expect(document.getElementById("confirm-dialog")).toHaveClass("with-preview");
  });

  it("does not submit the form natively", () => {
    open();
    const form = document.querySelector("form") as HTMLFormElement;
    expect(fireEvent.submit(form)).toBe(false);
  });
});
