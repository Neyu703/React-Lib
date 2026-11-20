import { type ReactNode } from "react";
interface Props {
    id: string;
    /** Fixed per dialog: the launcher recognises the popup window by `Dienstplan · <windowTitle>`. */
    windowTitle: string;
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
    labelledBy?: string;
    /** Confirmations and progress are always fixed and modal, and never displaced by the dialog limit. */
    exempt?: boolean;
    /** Esc is ignored while true (running jobs cannot be cancelled). */
    blockEscape?: boolean;
}
export declare function Modal({ id, windowTitle, open, onClose, children, className, labelledBy, exempt, blockEscape, }: Props): import("react").JSX.Element;
export {};
