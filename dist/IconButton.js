import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckIcon, CloseIcon, EditIcon, ExitIcon, PlusIcon, RefreshIcon, SwapIcon, TrashIcon } from "./icons.js";
const ICONS = {
    edit: EditIcon,
    trash: TrashIcon,
    save: CheckIcon,
    close: CloseIcon,
    plus: PlusIcon,
    swap: SwapIcon,
    refresh: RefreshIcon,
    exit: ExitIcon,
};
/** A square button with an icon instead of text (or, with `text`, icon plus visible text); the label is its accessible name and its tooltip. Use `primary` for save/add, `danger-solid` for delete. */
export function IconButton({ icon, label, text, className, type = "button", ...rest }) {
    const Icon = ICONS[icon];
    return (_jsxs("button", { type: type, className: ["icon-button", text ? "icon-button-text" : "", className ?? ""].filter(Boolean).join(" "), "aria-label": label, title: label, ...rest, children: [_jsx(Icon, {}), text ? _jsx("span", { children: text }) : null] }));
}
