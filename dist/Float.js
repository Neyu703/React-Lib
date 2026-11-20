import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Label inside the field that floats up once the field has a value or focus (styles: scss/_float.scss). Works for text/number inputs (need `placeholder=" "`), selects (always floated), and the TimeField and DateField of the app */
export function Float({ label, always, required, missing, className, id, children, }) {
    return (_jsxs("label", { id: id, className: [
            "float",
            always ? "always" : "",
            required ? "required" : "",
            missing ? "missing" : "",
            className ?? "",
        ]
            .filter(Boolean)
            .join(" "), children: [children, _jsx("span", { className: "float-label", children: label })] }));
}
