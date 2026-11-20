import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const formatDuration = (ms) => ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
const STEP_ICONS = {
    pending: "○",
    running: "◔",
    done: "✓",
    failed: "✕",
    skipped: "–",
};
/** Zeigt Schritte, Zähler und Dauer eines Vorgangs an. Die App liefert die Schritte. */
export function JobSteps({ steps, id }) {
    return (_jsx("ol", { id: id, className: "job-steps", children: steps.map((step, index) => (_jsxs("li", { className: `job-step ${step.status}`, children: [_jsx("span", { className: "job-icon", "aria-hidden": "true", children: STEP_ICONS[step.status] }), _jsxs("span", { className: "job-label", children: [step.label, step.total ? ` (${Math.min(step.current ?? 0, step.total)} von ${step.total})` : "", step.detail ? _jsx("span", { className: "job-detail", children: step.detail }) : null] }), _jsx("span", { className: "job-duration", children: step.duration_ms === null ? "" : formatDuration(step.duration_ms) })] }, index))) }));
}
