import { DialogFrame, Modal } from "../dialogs/index.js";
import type { ConfirmViewProps } from "./types.js";

export function ConfirmView({
  title,
  text,
  yesLabel,
  preview,
  done,
}: ConfirmViewProps) {
  return (
    <Modal
      id="confirm-dialog"
      windowTitle="Bestätigen"
      open
      exempt
      onClose={() => done(false)}
      className={preview ? "with-preview" : undefined}
    >
      <DialogFrame
        titleId="confirm-title"
        title={title}
        onSubmit={(event) => event.preventDefault()}
        actions={
          <>
            <button
              type="button"
              id="confirm-no"
              onClick={() => done(false)}
            >
              Abbrechen
            </button>
            <button
              type="button"
              id="confirm-yes"
              className="primary"
              autoFocus
              onClick={() => done(true)}
            >
              {yesLabel}
            </button>
          </>
        }
      >
        <p id="confirm-text">{text}</p>
        {preview ? <div id="confirm-preview">{preview}</div> : null}
      </DialogFrame>
    </Modal>
  );
}
