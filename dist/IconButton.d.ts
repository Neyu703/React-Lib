import type { ButtonHTMLAttributes } from "react";
import { CheckIcon, CloseIcon, EditIcon, PlusIcon, SwapIcon, TrashIcon } from "./icons.js";
declare const ICONS: {
    readonly edit: typeof EditIcon;
    readonly trash: typeof TrashIcon;
    readonly save: typeof CheckIcon;
    readonly close: typeof CloseIcon;
    readonly plus: typeof PlusIcon;
    readonly swap: typeof SwapIcon;
};
export type IconName = keyof typeof ICONS;
type Props = {
    icon: IconName;
    label: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "title" | "children">;
/** A square button with an icon instead of text; the label is its accessible name and its tooltip. Use `primary` for save/add, `danger-solid` for delete. */
export declare function IconButton({ icon, label, className, type, ...rest }: Props): import("react").JSX.Element;
export {};
