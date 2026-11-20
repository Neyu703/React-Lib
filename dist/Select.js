import { jsx as _jsx } from "react/jsx-runtime";
/** Native select with the lib look; use inside `Float` for a floating label, otherwise `label` is the accessible name. */
export function Select({ id, label, value, onChange, options, disabled, className }) {
    return (_jsx("select", { id: id, className: ["select", className ?? ""].filter(Boolean).join(" "), "aria-label": label, value: value, disabled: disabled, onChange: (event) => onChange(event.target.value), children: options.map(([optionValue, optionLabel]) => (_jsx("option", { value: optionValue, children: optionLabel }, optionValue))) }));
}
