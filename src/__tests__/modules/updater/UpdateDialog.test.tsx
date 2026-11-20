import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../modules/dialogs/Modal.js", () => ({
  Modal: ({ children, onClose }: { children: ReactNode; onClose: () => void }) => (
    <div>
      <button
        type="button"
        onClick={onClose}
      >
        modal-onclose
      </button>
      {children}
    </div>
  ),
}));

import { configureReactLib } from "../../../core/index.js";
import { UpdateDialog } from "../../../modules/updater/UpdateDialog.js";

const postMock = vi.fn();
const info = { state: "available", info: "Version 1.2.3" };
const open = (onClose = vi.fn()) => {
  render(
    <UpdateDialog
      info={info}
      onClose={onClose}
    />,
  );
  return onClose;
};
const silence = (): HTMLElement =>
  screen.getByLabelText("Bis zum nächsten Start nicht mehr fragen");

beforeEach(() => {
  vi.resetAllMocks();
  configureReactLib({ startUpdate: postMock });
});

describe("UpdateDialog", () => {
  it("offers Später and Jetzt aktualisieren by default", () => {
    open();
    expect(screen.getByRole("button", { name: "Später" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Jetzt aktualisieren" })).toBeInTheDocument();
  });

  it("turns the main button into Schließen once the silence box is checked", () => {
    const onClose = open();
    fireEvent.click(silence());
    expect(screen.queryByRole("button", { name: "Später" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Jetzt aktualisieren" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Schließen" }));
    expect(onClose).toHaveBeenCalledWith(true);
    expect(postMock).not.toHaveBeenCalled();
  });

  it("goes back to the update buttons when the box is unchecked again", () => {
    open();
    fireEvent.click(silence());
    fireEvent.click(silence());
    expect(screen.getByRole("button", { name: "Jetzt aktualisieren" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Später" })).toBeInTheDocument();
  });

  it("closes without silencing on Später", () => {
    const onClose = open();
    fireEvent.click(screen.getByRole("button", { name: "Später" }));
    expect(onClose).toHaveBeenCalledWith(false);
  });

  it("starts the update and tells the user the installer takes over", async () => {
    postMock.mockResolvedValue({ state: "started", message: "" });
    open();
    fireEvent.click(screen.getByRole("button", { name: "Jetzt aktualisieren" }));
    await waitFor(() => expect(postMock).toHaveBeenCalledWith());
    expect(await screen.findByText(/Installationsfenster übernimmt/)).toBeInTheDocument();
  });

  it("shows the error and offers a retry when the update fails", async () => {
    postMock.mockResolvedValue({ state: "failed", message: "Kein Zugriff" });
    open();
    fireEvent.click(screen.getByRole("button", { name: "Jetzt aktualisieren" }));
    expect(await screen.findByText("Kein Zugriff")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeEnabled();
  });

  it("stays quiet when the connection is gone because the program is quitting", async () => {
    postMock.mockRejectedValue(new Error("offline"));
    open();
    fireEvent.click(screen.getByRole("button", { name: "Jetzt aktualisieren" }));
    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("button", { name: "Erneut versuchen" })).toBeNull();
  });

  it("does not submit the form natively", () => {
    open();
    const form = document.getElementById("update-form") as HTMLFormElement;
    expect(fireEvent.submit(form)).toBe(false);
  });

  it("ignores the modal closing while the update is being started", async () => {
    postMock.mockReturnValue(new Promise(() => undefined));
    const onClose = open();
    fireEvent.click(screen.getByRole("button", { name: "Jetzt aktualisieren" }));
    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "modal-onclose" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("passes the silence choice on when the modal closes", () => {
    const onClose = open();
    fireEvent.click(silence());
    fireEvent.click(screen.getByRole("button", { name: "modal-onclose" }));
    expect(onClose).toHaveBeenCalledWith(true);
  });
});
