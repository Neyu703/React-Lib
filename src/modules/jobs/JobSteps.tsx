import type { JobStep } from "./types.js";

export const formatDuration = (ms: number): string =>
  ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;

const STEP_ICONS: Record<JobStep["status"], string> = {
  pending: "○",
  running: "◔",
  done: "✓",
  failed: "✕",
  skipped: "–",
};

/** Zeigt Schritte, Zähler und Dauer eines Vorgangs an. Die App liefert die Schritte. */
export function JobSteps({ steps, id }: { steps: readonly JobStep[]; id?: string }) {
  return (
    <ol id={id} className="job-steps">
      {steps.map((step, index) => (
        <li key={index} className={`job-step ${step.status}`}>
          <span className="job-icon" aria-hidden="true">{STEP_ICONS[step.status]}</span>
          <span className="job-label">
            {step.label}
            {step.total ? ` (${Math.min(step.current ?? 0, step.total)} von ${step.total})` : ""}
            {step.detail ? <span className="job-detail">{step.detail}</span> : null}
          </span>
          <span className="job-duration">
            {step.duration_ms === null ? "" : formatDuration(step.duration_ms)}
          </span>
        </li>
      ))}
    </ol>
  );
}
