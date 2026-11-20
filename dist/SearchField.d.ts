type Props = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
};
export declare function SearchField({ id, label, value, onChange, className }: Props): import("react").JSX.Element;
export {};
