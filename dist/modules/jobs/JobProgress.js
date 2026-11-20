import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { DialogFrame, Modal } from "../dialogs/index.js";
import { reactLibHandlers } from "../../core/host.js";
import { jobAutoCloseSet, jobViewCleared } from "./slice.js";
import { useReactLibDispatch, useReactLibSelector } from "../../core/hooks.js";
const formatDuration = (ms) => ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
const STEP_ICONS = {
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
    const log = useRef(null);
    useEffect(() => {
        const element = log.current;
        if (element && element.scrollTop + element.clientHeight >= element.scrollHeight - 80)
            element.scrollTop = element.scrollHeight;
    }, [view?.events.length]);
    if (!view)
        return null;
    const { snapshot, events, running, elapsed } = view;
    const steps = snapshot?.steps ?? [];
    const counted = steps.find((step) => step.total);
    const value = !running
        ? 100
        : counted
            ? Math.round((100 * (counted.current ?? 0)) / counted.total)
            : undefined;
    const seconds = formatDuration(Math.round(elapsed));
    return (_jsx(Modal, { id: "job-dialog", windowTitle: "Fortschritt", open: true, exempt: true, blockEscape: running, className: "job-dialog", labelledBy: "job-title", onClose: () => {
            if (!running)
                dispatch(jobViewCleared());
        }, children: _jsxs(DialogFrame, { titleId: "job-title", title: snapshot?.title ?? "Fortschritt", actions: _jsxs(_Fragment, { children: [_jsxs("label", { className: "check-row job-autoclose", children: [_jsx("input", { type: "checkbox", id: "job-autoclose", checked: autoClose, onChange: (event) => {
                                    dispatch(jobAutoCloseSet(event.target.checked));
                                    reactLibHandlers().autoCloseChanged(event.target.checked);
                                } }), " ", "Nach Erfolg automatisch schlie\u00DFen"] }), _jsx("button", { type: "button", id: "job-close", className: "primary", disabled: running, autoFocus: !running, onClick: () => dispatch(jobViewCleared()), children: "Schlie\u00DFen" })] }), children: [_jsx("progress", { id: "job-bar", max: 100, value: value }), _jsx("p", { id: "job-status", className: "muted", "aria-live": "polite", children: running
                        ? "Läuft …"
                        : snapshot?.ok === false
                            ? `Fehlgeschlagen nach ${seconds}. Einzelheiten stehen im Protokoll.`
                            : `Fertig in ${seconds}.` }), _jsx("p", { className: "muted", children: "L\u00E4ngere Berechnungen d\u00FCrfen dauern. Du kannst das Fenster minimieren: Der Fortschritt steht als Balken im Taskleisten-Button und im Symbol neben der Uhr, und nach l\u00E4ngeren L\u00E4ufen meldet sich Windows, sobald alles fertig ist." }), _jsx("ol", { id: "job-steps", className: "job-steps", children: steps.map((step, at) => (_jsxs("li", { className: `job-step ${step.status}`, children: [_jsx("span", { className: "job-icon", "aria-hidden": "true", children: STEP_ICONS[step.status] }), _jsxs("span", { className: "job-label", children: [step.label, step.total
                                        ? ` (${Math.min(step.current ?? 0, step.total)} von ${step.total})`
                                        : "", step.detail ? _jsx("span", { className: "job-detail", children: step.detail }) : null] }), _jsx("span", { className: "job-duration", children: step.duration_ms === null ? "" : formatDuration(step.duration_ms) })] }, at))) }), _jsx("h3", { children: "Ablauf" }), _jsx("ol", { id: "job-log", className: "job-log", tabIndex: 0, ref: log, children: events.map((event, at) => (_jsxs("li", { className: event.level, children: [_jsxs("span", { className: "job-time", children: ["+", formatDuration(event.ms)] }), " ", event.text] }, at))) })] }) }));
}
