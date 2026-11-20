import { jsx as _jsx } from "react/jsx-runtime";
import { CheckIcon, CloseIcon, EditIcon, PlusIcon, SwapIcon, TrashIcon } from "./icons.js";
const ICONS = {
    edit: EditIcon,
    trash: TrashIcon,
    save: CheckIcon,
    close: CloseIcon,
    plus: PlusIcon,
    swap: SwapIcon,
};
/** A square button with an icon instead of text; the label is its accessible name and its tooltip. Use `primary` for save/add, `danger-solid` for delete. */
export function IconButton({ icon, label, className, type = "button", ...rest }) {
    const Icon = ICONS[icon];
    return (_jsx("button", { type: type, className: ["icon-button", className ?? ""].filter(Boolean).join(" "), "aria-label": label, title: label, ...rest, children: _jsx(Icon, {}) }));
}
