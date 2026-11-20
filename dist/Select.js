import { jsx as _jsx } from "react/jsx-runtime";
/** Native select with the lib look; use inside `Float` for a floating label, otherwise `label` is the accessible name. */
export function Select({ id, label, value, onChange, options, className, ...attributes }) {
    return (_jsx("select", { id: id, className: ["select", className ?? ""].filter(Boolean).join(" "), "aria-label": label, value: value, onChange: (event) => onChange(event.target.value), ...attributes, children: options.map(([optionValue, optionLabel, disabled]) => (_jsx("option", { value: optionValue, disabled: disabled, children: optionLabel }, optionValue))) }));
}
