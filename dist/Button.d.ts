import type { ButtonHTMLAttributes } from "react";
export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "small" | "normal";
type Props = {
    variant?: ButtonVariant;
    size?: ButtonSize;
} & ButtonHTMLAttributes<HTMLButtonElement>;
/** A text button. `primary` for the main action, `danger` for destructive ones; `type` defaults to "button". */
export declare function Button({ variant, size, className, type, ...rest }: Props): import("react").JSX.Element;
export {};
