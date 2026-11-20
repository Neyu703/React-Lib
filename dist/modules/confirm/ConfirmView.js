import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DialogFrame, Modal } from "../dialogs/index.js";
export function ConfirmView({ title, text, yesLabel, preview, done, }) {
    return (_jsx(Modal, { id: "confirm-dialog", windowTitle: "Best\u00E4tigen", open: true, exempt: true, onClose: () => done(false), className: preview ? "with-preview" : undefined, children: _jsxs(DialogFrame, { titleId: "confirm-title", title: title, onSubmit: (event) => event.preventDefault(), actions: _jsxs(_Fragment, { children: [_jsx("button", { type: "button", id: "confirm-no", onClick: () => done(false), children: "Abbrechen" }), _jsx("button", { type: "button", id: "confirm-yes", className: "primary", autoFocus: true, onClick: () => done(true), children: yesLabel })] }), children: [_jsx("p", { id: "confirm-text", children: text }), preview ? _jsx("div", { id: "confirm-preview", children: preview }) : null] }) }));
}
