import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { DialogFrame, Modal } from "../dialogs/index.js";
import { reactLibHandlers } from "../../core/host.js";
export function UpdateDialog({ info, onClose, }) {
    const [silence, setSilence] = useState(false);
    const [busy, setBusy] = useState(false);
    const [started, setStarted] = useState(false);
    const [error, setError] = useState("");
    const [retry, setRetry] = useState(false);
    const now = async () => {
        setBusy(true);
        setError("");
        try {
            const status = await reactLibHandlers().startUpdate();
            if (status.state !== "failed") {
                setStarted(true);
                return;
            }
            setError(status.message);
        }
        catch {
            return; // connection gone: the program is quitting, the connection watcher closes the window
        }
        setRetry(true);
        setBusy(false);
    };
    return (_jsx(Modal, { id: "update-dialog", windowTitle: "Update", open: true, labelledBy: "update-title", blockEscape: busy, onClose: () => {
            if (!busy)
                onClose(silence);
        }, children: _jsxs(DialogFrame, { id: "update-form", titleId: "update-title", title: "Neue Version verf\u00FCgbar", onSubmit: (event) => event.preventDefault(), actions: _jsxs(_Fragment, { children: [silence ? null : (_jsx("button", { type: "button", id: "update-later", disabled: busy, onClick: () => onClose(false), children: "Sp\u00E4ter" })), _jsx("button", { type: "button", id: "update-now", className: "primary", disabled: busy, onClick: () => (silence ? onClose(true) : void now()), children: silence ? "Schließen" : retry ? "Erneut versuchen" : "Jetzt aktualisieren" })] }), children: [_jsx("p", { id: "update-text", children: started
                        ? "Das Installationsfenster übernimmt, dieses Fenster schließt sich gleich. Bitte nicht schließen."
                        : `Eine neue Version (${info.info}) ist da. Jetzt aktualisieren?` }), error ? (_jsx("p", { id: "update-error", className: "muted", children: error })) : null, _jsxs("label", { className: "check-row", children: [_jsx("input", { type: "checkbox", id: "update-silence", checked: silence, onChange: (event) => setSilence(event.target.checked) }), " ", "Bis zum n\u00E4chsten Start nicht mehr fragen"] })] }) }));
}
