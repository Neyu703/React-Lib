import { useEffect, useRef } from "react";
import { DialogFrame, Modal } from "../dialogs/index.js";
import { reactLibHandlers } from "../../core/host.js";
import { jobAutoCloseSet, jobViewCleared } from "./slice.js";
import type { JobStep } from "./types.js";
import { useReactLibDispatch, useReactLibSelector } from "../../core/hooks.js";

const formatDuration = (ms: number): string =>
  ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
const STEP_ICONS: Record<JobStep["status"], string> = {
  pending: "○",
  running: "◔",
  done: "✓",
  failed: "✕",
  skipped: "–",
};

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
        <ol
          id="job-steps"
          className="job-steps"
        >
          {steps.map((step, at) => (
            <li
              key={at}
              className={`job-step ${step.status}`}
            >
              <span
                className="job-icon"
                aria-hidden="true"
              >
                {STEP_ICONS[step.status]}
              </span>
              <span className="job-label">
                {step.label}
                {step.total
                  ? ` (${Math.min(step.current ?? 0, step.total)} von ${step.total})`
                  : ""}
                {step.detail ? <span className="job-detail">{step.detail}</span> : null}
              </span>
              <span className="job-duration">
                {step.duration_ms === null ? "" : formatDuration(step.duration_ms)}
              </span>
            </li>
          ))}
        </ol>
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
