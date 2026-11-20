import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** The frame every dialog shares: head with the title and a divider, scrolling content, footer with the actions. */
export function DialogFrame({ id, title, headExtra, titleId, onSubmit, noValidate, actions, actionsClassName, children, }) {
    const parts = (_jsxs(_Fragment, { children: [_jsxs("div", { className: "dialog-head", children: [_jsx("h2", { id: titleId, children: title }), headExtra] }), _jsx("div", { className: "dialog-content", children: children }), _jsx("div", { className: ["dialog-actions", "dialog-foot", actionsClassName ?? ""]
                    .filter(Boolean)
                    .join(" "), children: actions })] }));
    return onSubmit ? (_jsx("form", { autoComplete: "off", method: "dialog", id: id, className: "dialog-frame", noValidate: noValidate, onSubmit: onSubmit, children: parts })) : (_jsx("div", { id: id, className: "dialog-frame", children: parts }));
}
