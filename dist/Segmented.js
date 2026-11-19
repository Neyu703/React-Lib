import { jsx as _jsx } from "react/jsx-runtime";
/** Equal-width option buttons with a thumb that slides under the pressed one (hidden when none is pressed). */
export function Segmented({ label, options, value, onPick, id, }) {
    const at = options.findIndex(([key]) => key === value);
    return (_jsx("div", { id: id, className: "segmented", role: "group", "aria-label": label, "data-count": options.length, "data-at": at, children: options.map(([key, text, hint]) => (_jsx("button", { type: "button", title: hint, "aria-pressed": value === key, onClick: () => onPick(key), children: text }, key))) }));
}
