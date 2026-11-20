import { jsx as _jsx } from "react/jsx-runtime";
/** Small "i" tooltip next to headings. */
export function InfoTip({ children }) {
    return (_jsx("span", { className: "info-tip", "aria-label": "Info", children: _jsx("span", { className: "info-tip-text", role: "tooltip", children: children }) }));
}
