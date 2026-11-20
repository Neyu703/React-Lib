import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from "react";
import { CloseIcon } from "./icons.js";
export function SearchField({ id, label, value, onChange, className }) {
    const input = useRef(null);
    const clear = () => {
        onChange("");
        input.current?.focus();
    };
    return (_jsxs("div", { className: ["search-field", className].filter(Boolean).join(" "), children: [_jsxs("svg", { className: "search-icon", viewBox: "0 0 20 20", width: "20", height: "20", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", "aria-hidden": "true", children: [_jsx("circle", { cx: "8.5", cy: "8.5", r: "5.5" }), _jsx("path", { d: "m13 13 4 4" })] }), _jsx("input", { ref: input, id: id, type: "search", "aria-label": label, placeholder: label, autoComplete: "off", value: value, onChange: (event) => onChange(event.target.value), onKeyDown: (event) => {
                    if (event.key !== "Escape" || !value)
                        return;
                    event.preventDefault();
                    event.stopPropagation();
                    clear();
                } }), _jsx("button", { type: "button", className: "search-clear", "aria-label": `${label}: Suche leeren`, title: "Suche leeren", hidden: !value, onClick: clear, children: _jsx(CloseIcon, {}) })] }));
}
