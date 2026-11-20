type Props = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    /** `[value, label]` pairs. */
    options: readonly (readonly [string, string])[];
    disabled?: boolean;
    className?: string;
};
/** Native select with the lib look; use inside `Float` for a floating label, otherwise `label` is the accessible name. */
export declare function Select({ id, label, value, onChange, options, disabled, className }: Props): import("react").JSX.Element;
export {};
