import type { ReactNode } from "react";
/** Label inside the field that floats up once the field has a value or focus (styles: scss/_float.scss). Works for text/number inputs (need `placeholder=" "`), selects (always floated), and the TimeField and DateField of the app */
export declare function Float({ label, always, required, missing, className, id, children, }: {
    label: string;
    always?: boolean;
    required?: boolean;
    missing?: boolean;
    className?: string;
    id?: string;
    children: ReactNode;
}): import("react").JSX.Element;
