type Props = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    /** Hint inside the empty field; defaults to `label`. */
    placeholder?: string;
    className?: string;
};
export declare function SearchField({ id, label, value, onChange, placeholder, className }: Props): import("react").JSX.Element;
export {};
