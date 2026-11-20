import { jsx as _jsx } from "react/jsx-runtime";
/** A text button. `primary` for the main action, `danger` for destructive ones; `type` defaults to "button". */
export function Button({ variant = "secondary", size = "normal", className, type = "button", ...rest }) {
    return (_jsx("button", { type: type, className: ["button", `button-${variant}`, size === "small" ? "button-small" : "", className ?? ""]
            .filter(Boolean)
            .join(" "), ...rest }));
}
