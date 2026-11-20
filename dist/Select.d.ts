import type { SelectHTMLAttributes } from "react";
type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children" | "defaultValue" | "multiple" | "onChange" | "value"> & {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    /** Einträge aus Wert, Beschriftung und optionalem Sperrstatus. */
    options: readonly (readonly [value: string, label: string, disabled?: boolean])[];
};
/** Native select with the lib look; use inside `Float` for a floating label, otherwise `label` is the accessible name. */
export declare function Select({ id, label, value, onChange, options, className, ...attributes }: Props): import("react").JSX.Element;
export {};
