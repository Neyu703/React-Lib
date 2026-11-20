import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "./icons.js";
export function PreviewSelect({ id, label, value, options, onChange, onPreview }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const root = useRef(null);
    const trigger = useRef(null);
    const selected = options.findIndex((option) => option.value === value);
    const close = () => {
        setOpen(false);
        setActive(-1);
        onPreview(null);
    };
    const preview = (at) => {
        setActive(at);
        onPreview(options[at]?.value ?? null);
    };
    const pick = (at) => {
        const option = options[at];
        if (!option)
            return;
        onChange(option.value);
        close();
        trigger.current?.focus();
    };
    useEffect(() => () => onPreview(null), [onPreview]);
    useEffect(() => {
        if (!open)
            return;
        const outside = (event) => {
            if (root.current?.contains(event.target))
                return;
            setOpen(false);
            setActive(-1);
            onPreview(null);
        };
        document.addEventListener("pointerdown", outside);
        return () => document.removeEventListener("pointerdown", outside);
    }, [open, onPreview]);
    useEffect(() => {
        if (open && active >= 0)
            document.getElementById(`${id}-option-${active}`)?.scrollIntoView?.({ block: "nearest" });
    }, [open, active, id]);
    const onKeyDown = (event) => {
        if (event.key === "Tab") {
            close();
            return;
        }
        if (event.key === "Escape" && open) {
            event.preventDefault();
            event.stopPropagation();
            close();
            return;
        }
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            if (!options.length)
                return;
            const start = open && active >= 0 ? active : Math.max(selected, 0);
            const next = event.key === "Home"
                ? 0
                : event.key === "End"
                    ? options.length - 1
                    : !open
                        ? start
                        : (start + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
            setOpen(true);
            preview(next);
            return;
        }
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (open && active >= 0)
                pick(active);
            else {
                setOpen(true);
                preview(Math.max(selected, 0));
            }
        }
    };
    return (_jsxs("div", { className: "preview-select", ref: root, onMouseLeave: () => {
            setActive(-1);
            onPreview(null);
        }, onBlur: (event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
                close();
        }, children: [_jsxs("button", { ref: trigger, id: id, type: "button", role: "combobox", className: "preview-select-trigger", "aria-label": label, "aria-haspopup": "listbox", "aria-expanded": open, "aria-controls": `${id}-options`, "aria-activedescendant": open && active >= 0 ? `${id}-option-${active}` : undefined, onKeyDown: onKeyDown, onClick: () => {
                    if (open)
                        close();
                    else {
                        setOpen(true);
                        preview(Math.max(selected, 0));
                    }
                }, children: [_jsx("span", { className: "preview-select-label", "aria-hidden": "true", children: label }), _jsx("span", { className: "preview-select-value", children: options[selected]?.label ?? "Alle" }), _jsx("svg", { className: "preview-select-arrow", viewBox: "0 0 16 16", width: "16", height: "16", fill: "none", stroke: "currentColor", strokeWidth: "1.6", "aria-hidden": "true", children: _jsx("path", { d: "m4 6 4 4 4-4" }) })] }), open ? (_jsx("div", { id: `${id}-options`, className: "preview-select-options", role: "listbox", "aria-label": label, children: options.map((option, at) => (_jsxs("button", { id: `${id}-option-${at}`, type: "button", role: "option", tabIndex: -1, "aria-selected": option.value === value, className: active === at ? "preview-active" : undefined, onMouseEnter: () => preview(at), onMouseDown: (event) => event.preventDefault(), onClick: () => pick(at), children: [_jsx("span", { children: option.label }), option.value === value ? _jsx(CheckIcon, {}) : null] }, option.value))) })) : null] }));
}
