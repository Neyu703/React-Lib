import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { CalendarPopover } from "./CalendarPopover.js";
import { autoDateText, completeDateText } from "./dateTyping.js";
const pad = (value) => String(value).padStart(2, "0");
const toIso = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;
/** "2026-03-07" → "07.03.2026"; "" for anything else. */
export function formatDate(iso) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return match ? `${match[3]}.${match[2]}.${match[1]}` : "";
}
/** "7.3.2026" or "07.03.2026" → "2026-03-07"; "" when not a real calendar date. */
export function parseDate(text) {
    const match = /^\s*(\d{1,2})\.(\d{1,2})\.(\d{4})\s*$/.exec(text);
    if (!match)
        return "";
    const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
    const probe = new Date(year, month - 1, day);
    return probe.getFullYear() === year && probe.getMonth() === month - 1 && probe.getDate() === day
        ? toIso(year, month - 1, day)
        : "";
}
/** Text input for TT.MM.JJJJ plus a calendar popover (replaces the native date picker). Value is ISO yyyy-mm-dd or "". */
export function DateField({ value, onChange, id, min, required, disabled }) {
    const [text, setText] = useState(formatDate(value));
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const rootRef = useRef(null);
    const popoverRef = useRef(null);
    useEffect(() => setText(formatDate(value)), [value]);
    useEffect(() => {
        if (!open)
            return undefined;
        const close = (event) => {
            if (!popoverRef.current?.contains(event.target) &&
                !rootRef.current?.contains(event.target))
                setOpen(false);
        };
        const onKey = (event) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                setOpen(false);
            }
        };
        document.addEventListener("pointerdown", close);
        document.addEventListener("keydown", onKey, true);
        return () => {
            document.removeEventListener("pointerdown", close);
            document.removeEventListener("keydown", onKey, true);
        };
    }, [open]);
    const toggle = () => {
        if (!open && rootRef.current) {
            const rect = rootRef.current.getBoundingClientRect();
            setPosition({
                top: Math.min(rect.bottom + 6, window.innerHeight - 330),
                left: Math.min(rect.left, window.innerWidth - 260),
            });
        }
        setOpen(!open);
    };
    const choose = (iso) => {
        onChange(iso);
        setOpen(false);
    };
    const commit = (raw) => {
        const iso = parseDate(completeDateText(raw));
        if (iso) {
            if (iso !== value)
                onChange(iso);
            setText(formatDate(iso));
        }
        else if (raw.trim() === "") {
            if (value)
                onChange("");
            setText("");
        }
        else
            setText(formatDate(value));
    };
    return (_jsxs("span", { className: "date-field", ref: rootRef, children: [_jsx("input", { type: "text", id: id, required: required, disabled: disabled, inputMode: "numeric", placeholder: "TT.MM.JJJJ", maxLength: 10, autoComplete: "off", value: text, "aria-invalid": text.length === 10 && !parseDate(text), onChange: (event) => {
                    const raw = event.target.value;
                    const next = raw.length < text.length ? raw.replace(/[^\d.]/g, "") : autoDateText(raw); // deleting must not bring the dot back
                    setText(next);
                    const iso = parseDate(next);
                    if (iso && next.length === 10)
                        onChange(iso);
                }, onBlur: (event) => commit(event.target.value), onKeyDown: (event) => {
                    if (event.key === "ArrowDown" && event.altKey) {
                        event.preventDefault();
                        toggle();
                    }
                } }), _jsx("button", { type: "button", className: "date-toggle", disabled: disabled, "aria-label": "Kalender \u00F6ffnen", "aria-expanded": open, onClick: toggle, children: _jsxs("svg", { viewBox: "0 0 16 16", width: "14", height: "14", "aria-hidden": "true", children: [_jsx("rect", { x: "1.7", y: "3", width: "12.6", height: "11", rx: "2", fill: "none", stroke: "currentColor", strokeWidth: "1.4" }), _jsx("path", { d: "M1.7 6.6h12.6M5 1.5v3M11 1.5v3", fill: "none", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" })] }) }), open ? (_jsx(CalendarPopover, { popoverRef: popoverRef, position: position, value: value, min: min, required: required, label: "Datum w\u00E4hlen", onPick: choose })) : null] }));
}
