import { type CSSProperties, type RefObject } from "react";
interface Props {
    popoverRef: RefObject<HTMLDivElement | null>;
    position: CSSProperties;
    /** Selected day (ISO); the month of it is shown first. With `weekly` its whole week is marked. */
    value: string;
    /** Days before this one (ISO) cannot be picked. */
    min?: string;
    required?: boolean;
    weekly?: boolean;
    label: string;
    onPick: (iso: string) => void;
}
/** Month calendar in a popover (shared by DateField and WeekField). It starts on the month of `value` each time it opens. */
export declare function CalendarPopover({ popoverRef, position, value, min, required, weekly, label, onPick, }: Props): import("react").JSX.Element;
export {};
