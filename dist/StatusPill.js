import { jsx as _jsx } from "react/jsx-runtime";
/** A small coloured pill for a state (ok, warning, failure, neutral). */
export function StatusPill({ tone, live, className, children }) {
    return (_jsx("span", { role: live ? "status" : undefined, className: ["status-pill", `status-pill-${tone}`, className ?? ""].filter(Boolean).join(" "), children: children }));
}
