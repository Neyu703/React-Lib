import { jsx as _jsx } from "react/jsx-runtime";
/** The numbered step bar of the wizard and of the guides: finished steps are ticked, the current one is highlighted. */
export function WizardSteps({ id, steps, current, }) {
    return (_jsx("ol", { id: id, className: "wizard-steps", children: steps.map((title, at) => (_jsx("li", { className: at === current ? "current" : at < current ? "done" : undefined, "aria-current": at === current ? "step" : undefined, children: _jsx("span", { children: title }) }, title))) }));
}
