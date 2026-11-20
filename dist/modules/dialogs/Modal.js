import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, } from "react";
import { createPortal } from "react-dom";
import { saveDialogBox } from "./dialogBoxes.js";
import { blockNativeContextMenu } from "./nativeContextMenu.js";
import { moveTo, remember, place } from "./placement.js";
import { dialogClosed, dialogOpened } from "./slice.js";
import { applyPortalTheme } from "../portalTheme/index.js";
import { selectReactLib, useReactLibDispatch, useReactLibSelector, useReactLibStore, } from "../../core/hooks.js";
const TITLE_STRIP = 56;
let topLayer = 1000;
function useFloating(id, active, ref) {
    const store = useReactLibStore();
    const resets = useReactLibSelector((state) => state.dialogs.boxesReset);
    const seenResets = useRef(resets);
    useEffect(() => {
        const dialog = ref.current;
        if (!active || !dialog)
            return undefined;
        dialog.style.zIndex = String(++topLayer);
        const box = selectReactLib(store.getState()).dialogs.boxes[id];
        if (box?.width)
            dialog.style.width = box.width;
        if (box?.height)
            dialog.style.height = box.height;
        dialog.dataset.wantedX = String(box?.x ?? 0.5);
        dialog.dataset.wantedY = String(box?.y ?? 0.5);
        const refit = () => place(dialog);
        refit();
        const onUp = () => {
            remember(dialog);
            refit();
            saveDialogBox(store, id, dialog);
        };
        window.addEventListener("pointerup", onUp);
        window.addEventListener("resize", refit);
        return () => {
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("resize", refit);
        };
    }, [active, id, ref, store]);
    // "Forget all boxes": back to the middle and the original size.
    useEffect(() => {
        if (resets === seenResets.current)
            return;
        seenResets.current = resets;
        const dialog = ref.current;
        if (!active || !dialog)
            return;
        ["left", "top", "width", "height", "maxWidth", "maxHeight"].forEach((p) => {
            dialog.style.removeProperty(p.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));
        });
        dialog.dataset.wantedX = "0.5";
        dialog.dataset.wantedY = "0.5";
        place(dialog);
    }, [resets, active, ref]);
}
// A reload closes the popup windows of dialogs; that is not the user closing them, so their state (e.g. the wizard step) must survive.
let reloading = false;
window.addEventListener("pagehide", () => {
    reloading = true;
});
export function Modal({ id, windowTitle, open, onClose, children, className, labelledBy, exempt = false, blockEscape = false, }) {
    const dispatch = useReactLibDispatch();
    const store = useReactLibStore();
    const portal = useReactLibSelector((state) => state.portalTheme);
    const registered = useReactLibSelector((state) => state.dialogs.openIds.includes(id));
    const ref = useRef(null);
    const [popup, setPopup] = useState(null);
    const mode = exempt ? "fixed" : portal.dialogMode;
    const wantsWindow = open && mode === "window";
    const floating = open && mode === "float";
    // stable identity: an inline onClose would otherwise re-run the show/hide effect on every parent render and steal the focus
    const latestOnClose = useRef(onClose);
    latestOnClose.current = onClose;
    const close = useCallback(() => latestOnClose.current(), []);
    const tracking = useRef(false); // true while this dialog is registered by its own show effect
    const wasRegistered = useRef(false);
    // Popup window for mode "window"; falls back to floating when the browser blocks it.
    useLayoutEffect(() => {
        if (!wantsWindow) {
            setPopup(null);
            return undefined;
        }
        const width = 640;
        const height = 560;
        const opened = window.open("", `dialog-${id}`, `popup=yes,width=${width},height=${height},left=${Math.round(window.screenX + (window.outerWidth - width) / 2)},top=${Math.round(window.screenY + (window.outerHeight - height) / 2)}`);
        if (!opened) {
            setPopup(null);
            return undefined;
        }
        const doc = opened.document;
        doc.title = `Dienstplan · ${windowTitle}`;
        doc.documentElement.lang = "de";
        document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
            const copy = doc.createElement("link");
            copy.rel = "stylesheet";
            copy.href = link.href;
            doc.head.append(copy);
        });
        document
            .querySelectorAll("style")
            .forEach((style) => doc.head.append(doc.importNode(style, true)));
        const onKey = (event) => {
            if (event.key === "Escape")
                close();
        };
        doc.addEventListener("keydown", onKey);
        blockNativeContextMenu(doc);
        const onHide = () => {
            if (!reloading)
                close();
        };
        opened.addEventListener("pagehide", onHide);
        setPopup(opened);
        return () => {
            opened.removeEventListener("pagehide", onHide);
            setPopup(null);
            if (!opened.closed)
                opened.close();
        };
    }, [wantsWindow, id, windowTitle, close]);
    useEffect(() => {
        if (popup)
            applyPortalTheme(popup.document.documentElement, portal);
    }, [popup, portal]);
    const inWindow = wantsWindow && popup !== null;
    const asFloat = floating || (wantsWindow && popup === null);
    // Show / hide the native <dialog>
    useEffect(() => {
        const dialog = ref.current; // the <dialog> is always rendered
        if (!open) {
            if (dialog.open)
                dialog.close();
            return undefined;
        }
        if (!dialog.open) {
            if (asFloat || inWindow)
                dialog.show();
            else
                dialog.showModal();
        }
        // the slice evicts the oldest non-exempt dialog beyond the limit; `evicted` below then closes it
        if (!exempt) {
            tracking.current = true;
            dispatch(dialogOpened({ id }));
        }
        return () => {
            tracking.current = false;
            if (!exempt)
                dispatch(dialogClosed({ id }));
            if (dialog.open)
                dialog.close();
        };
    }, [open, asFloat, inWindow, id, exempt, dispatch]);
    // Closed by the host's dialog limit: another dialog opened and this was the oldest one.
    useEffect(() => {
        if (registered) {
            wasRegistered.current = true;
            return;
        }
        if (wasRegistered.current) {
            wasRegistered.current = false;
            if (tracking.current)
                close();
        }
    }, [registered, close]);
    useFloating(id, asFloat, ref);
    const onCancel = (event) => {
        event.preventDefault();
        if (!blockEscape)
            close();
    };
    useEffect(() => {
        if (!asFloat)
            return undefined;
        const onKey = (event) => {
            if (event.key === "Escape" &&
                !blockEscape &&
                ref.current &&
                Number(ref.current.style.zIndex) >= topLayer)
                close();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [asFloat, blockEscape, close]);
    const onPointerDown = (event) => {
        const dialog = ref.current;
        if (!asFloat || !dialog || event.button !== 0)
            return;
        dialog.style.zIndex = String(++topLayer);
        const rect = dialog.getBoundingClientRect();
        const target = event.target;
        if (target.closest("button, input, select, textarea, a, label, summary") ||
            event.clientY - rect.top > TITLE_STRIP ||
            event.clientX > rect.left + dialog.clientWidth)
            return;
        const grabX = event.clientX - rect.left;
        const grabY = event.clientY - rect.top;
        dialog.setPointerCapture(event.pointerId);
        const drag = (move) => moveTo(dialog, move.clientX - grabX, move.clientY - grabY);
        const drop = () => {
            dialog.removeEventListener("pointermove", drag);
            dialog.removeEventListener("pointerup", drop);
            remember(dialog);
            saveDialogBox(store, id, dialog);
        };
        dialog.addEventListener("pointermove", drag);
        dialog.addEventListener("pointerup", drop);
    };
    const element = (_jsxs("dialog", { ref: ref, id: id, className: [className, asFloat ? "floating" : "", inWindow ? "in-window" : ""]
            .filter(Boolean)
            .join(" "), "aria-labelledby": labelledBy, "data-window-title": windowTitle, onCancel: onCancel, onPointerDown: onPointerDown, children: [open ? children : null, open && !inWindow && !blockEscape ? (_jsx("button", { type: "button", className: "dialog-close", "aria-label": "Schlie\u00DFen", title: "Schlie\u00DFen", onClick: close, children: "\u2715" })) : null] }));
    return inWindow && popup ? createPortal(element, popup.document.body) : element;
}
