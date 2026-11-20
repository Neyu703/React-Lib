import type { ButtonHTMLAttributes } from "react";
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
} as const;

export type IconName = keyof typeof ICONS;

type Props = { icon: IconName; label: string; text?: string } & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "title" | "children"
>;

/** A square button with an icon instead of text (or, with `text`, icon plus visible text); the label is its accessible name and its tooltip. Use `primary` for save/add, `danger-solid` for delete. */
export function IconButton({ icon, label, text, className, type = "button", ...rest }: Props) {
  const Icon = ICONS[icon];
  return (
    <button
      type={type}
      className={["icon-button", text ? "icon-button-text" : "", className ?? ""].filter(Boolean).join(" ")}
      aria-label={label}
      title={label}
      {...rest}
    >
      <Icon />
      {text ? <span>{text}</span> : null}
    </button>
  );
}
