interface TimeFieldProps {
    value: string;
    onChange: (value: string) => void;
    name?: string;
    required?: boolean;
}
/** Time field without free typing: click opens two endless wheels (hours, minutes), so only valid HH:MM values are possible. */
export declare function TimeField({ value, onChange, name, required }: TimeFieldProps): import("react").JSX.Element;
export {};
