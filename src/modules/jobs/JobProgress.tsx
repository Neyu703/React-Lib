import { useEffect, useRef } from "react";
import { DialogFrame, Modal } from "../dialogs/index.js";
import { reactLibHandlers } from "../../core/host.js";
import { JobSteps, formatDuration } from "./JobSteps.js";
import { jobAutoCloseSet, jobViewCleared } from "./slice.js";
import { useReactLibDispatch, useReactLibSelector } from "../../core/hooks.js";

/** Shows the live progress of long actions; the app's API layer feeds it through `jobViewSet`. */
export function JobProgress() {
  const dispatch = useReactLibDispatch();
  const view = useReactLibSelector((state) => state.jobs.view);
  const autoClose = useReactLibSelector((state) => state.jobs.autoClose);
  const log = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const element = log.current;
    if (element && element.scrollTop + element.clientHeight >= element.scrollHeight - 80)
      element.scrollTop = element.scrollHeight;
  }, [view?.events.length]);

  if (!view) return null;
  const { snapshot, events, running, elapsed } = view;
  const steps = snapshot?.steps ?? [];
  const counted = steps.find((step) => step.total);
  const value = !running
    ? 100
    : counted
      ? Math.round((100 * (counted.current ?? 0)) / (counted.total as number))
      : undefined;
  const seconds = formatDuration(Math.round(elapsed));
  return (
    <Modal
      id="job-dialog"
      windowTitle="Fortschritt"
      open
      exempt
      blockEscape={running}
      className="job-dialog"
      labelledBy="job-title"
      onClose={() => {
        if (!running) dispatch(jobViewCleared());
      }}
    >
      <DialogFrame
        titleId="job-title"
        title={snapshot?.title ?? "Fortschritt"}
        actions={
          <>
            <label className="check-row job-autoclose">
              <input
                type="checkbox"
                id="job-autoclose"
                checked={autoClose}
                onChange={(event) => {
                  dispatch(jobAutoCloseSet(event.target.checked));
                  reactLibHandlers().autoCloseChanged(event.target.checked);
                }}
              />{" "}
              Nach Erfolg automatisch schließen
            </label>
            <button
              type="button"
              id="job-close"
              className="primary"
              disabled={running}
              autoFocus={!running}
              onClick={() => dispatch(jobViewCleared())}
            >
              Schließen
            </button>
          </>
        }
      >
        <progress
          id="job-bar"
          max={100}
          value={value}
        />
        <p
          id="job-status"
          className="muted"
          aria-live="polite"
        >
          {running
            ? "Läuft …"
            : snapshot?.ok === false
              ? `Fehlgeschlagen nach ${seconds}. Einzelheiten stehen im Protokoll.`
              : `Fertig in ${seconds}.`}
        </p>
        <p className="muted">
          Längere Berechnungen dürfen dauern. Du kannst das Fenster minimieren: Der Fortschritt
          steht als Balken im Taskleisten-Button und im Symbol neben der Uhr, und nach längeren
          Läufen meldet sich Windows, sobald alles fertig ist.
        </p>
        <JobSteps id="job-steps" steps={steps} />
        <h3>Ablauf</h3>
        <ol
          id="job-log"
          className="job-log"
          tabIndex={0}
          ref={log}
        >
          {events.map((event, at) => (
            <li
              key={at}
              className={event.level}
            >
              <span className="job-time">+{formatDuration(event.ms)}</span> {event.text}
            </li>
          ))}
        </ol>
      </DialogFrame>
    </Modal>
  );
}
