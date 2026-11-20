import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { InfoTip } from "../../InfoTip.js";
import { DialogFrame, Modal } from "../dialogs/index.js";
import { reactLibHandlers } from "../../core/host.js";
/** Entry text: {tab|Label} becomes a link that opens that tab. */
function ChangelogText({ text, onTab }) {
    const parts = [];
    const pattern = /\{(\w+)\|([^}]+)\}/g;
    let last = 0;
    for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
        parts.push(text.slice(last, match.index));
        const tab = match[1];
        parts.push(_jsx("a", { href: "#", className: "tab-link", "data-tab": tab, onClick: (event) => {
                event.preventDefault();
                onTab(tab);
            }, children: match[2] }, match.index));
        last = match.index + match[0].length;
    }
    parts.push(text.slice(last));
    return _jsx(_Fragment, { children: parts });
}
export function ChangelogDialog({ data, onClose, }) {
    const [hidden, setHidden] = useState(data.hidden);
    const groups = [];
    data.entries.forEach((entry) => {
        const last = groups[groups.length - 1];
        if (last && last.name === entry.group)
            last.entries.push(entry);
        else
            groups.push({ name: entry.group, entries: [entry] });
    });
    return (_jsx(Modal, { id: "changelog-dialog", windowTitle: "Neuigkeiten", open: true, labelledBy: "changelog-title", onClose: () => onClose(hidden), children: _jsx(DialogFrame, { id: "changelog-form", titleId: "changelog-title", title: _jsxs(_Fragment, { children: ["Feature-Log", " ", _jsx(InfoTip, { children: "Alle Funktionen des Dienstplans, neueste zuerst. Du findest sie jederzeit \u00FCber \u201EFeature-Log\u201C oben rechts." })] }), onSubmit: (event) => {
                event.preventDefault();
                onClose(hidden);
            }, actionsClassName: "changelog-actions", actions: _jsxs(_Fragment, { children: [_jsxs("label", { className: "inline-check", children: [_jsx("input", { type: "checkbox", id: "changelog-hide", checked: hidden, onChange: (event) => setHidden(event.target.checked) }), " ", "Nicht nochmal anzeigen"] }), _jsx("button", { type: "submit", className: "primary", children: "Schlie\u00DFen" })] }), children: _jsx("div", { id: "changelog-entries", children: groups.map((group, index) => {
                    const single = group.entries.length === 1 && !group.entries[0]?.title;
                    return (_jsxs("details", { className: "changelog-group", open: index === 0, children: [_jsxs("summary", { children: [group.name, single ? (_jsxs(_Fragment, { children: [" ", _jsx("span", { className: "muted", children: group.entries[0]?.date })] })) : null] }), group.entries.map((entry, at) => entry.title ? (_jsxs("details", { className: "changelog-entry", open: true, children: [_jsxs("summary", { children: [entry.title, " ", _jsx("span", { className: "muted", children: entry.date })] }), _jsx("p", { children: _jsx(ChangelogText, { text: entry.text, onTab: (tab) => {
                                                onClose(hidden);
                                                reactLibHandlers().openTab(tab);
                                            } }) })] }, at)) : (_jsx("p", { children: _jsx(ChangelogText, { text: entry.text, onTab: (tab) => {
                                        onClose(hidden);
                                        reactLibHandlers().openTab(tab);
                                    } }) }, at)))] }, group.name + index));
                }) }) }) }));
}
