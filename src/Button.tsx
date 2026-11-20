import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "small" | "normal";

type Props = {
  variant?: ButtonVariant;
  size?: ButtonSize;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/** A text button. `primary` for the main action, `danger` for destructive ones; `type` defaults to "button". */
export function Button({
  variant = "secondary",
  size = "normal",
  className,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={["button", `button-${variant}`, size === "small" ? "button-small" : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
