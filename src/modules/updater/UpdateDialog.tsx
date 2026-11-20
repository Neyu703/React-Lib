import { useState } from "react";
import { DialogFrame, Modal } from "../dialogs/index.js";
import { reactLibHandlers } from "../../core/host.js";
import type { UpdateInfo } from "./types.js";

export function UpdateDialog({
  info,
  onClose,
}: {
  info: UpdateInfo;
  onClose: (silence: boolean) => void;
}) {
  const [silence, setSilence] = useState(false);
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(false);

  const now = async (): Promise<void> => {
    setBusy(true);
    setError("");
    try {
      const status = await reactLibHandlers().startUpdate();
      if (status.state !== "failed") {
        setStarted(true);
        return;
      }
      setError(status.message);
    } catch {
      return; // connection gone: the program is quitting, the connection watcher closes the window
    }
    setRetry(true);
    setBusy(false);
  };

  return (
    <Modal
      id="update-dialog"
      windowTitle="Update"
      open
      labelledBy="update-title"
      blockEscape={busy}
      onClose={() => {
        if (!busy) onClose(silence);
      }}
    >
      <DialogFrame
        id="update-form"
        titleId="update-title"
        title="Neue Version verfügbar"
        onSubmit={(event) => event.preventDefault()}
        actions={
          <>
            {silence ? null : (
              <button
                type="button"
                id="update-later"
                disabled={busy}
                onClick={() => onClose(false)}
              >
                Später
              </button>
            )}
            <button
              type="button"
              id="update-now"
              className="primary"
              disabled={busy}
              onClick={() => (silence ? onClose(true) : void now())}
            >
              {silence ? "Schließen" : retry ? "Erneut versuchen" : "Jetzt aktualisieren"}
            </button>
          </>
        }
      >
        <p id="update-text">
          {started
            ? "Das Installationsfenster übernimmt, dieses Fenster schließt sich gleich. Bitte nicht schließen."
            : `Eine neue Version (${info.info}) ist da. Jetzt aktualisieren?`}
        </p>
        {error ? (
          <p
            id="update-error"
            className="muted"
          >
            {error}
          </p>
        ) : null}
        <label className="check-row">
          <input
            type="checkbox"
            id="update-silence"
            checked={silence}
            onChange={(event) => setSilence(event.target.checked)}
          />{" "}
          Bis zum nächsten Start nicht mehr fragen
        </label>
      </DialogFrame>
    </Modal>
  );
}
