type Option = {
    value: string;
    label: string;
};
type Props = {
    id: string;
    label: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    onPreview: (value: string | null) => void;
};
export declare function PreviewSelect({ id, label, value, options, onChange, onPreview }: Props): import("react").JSX.Element;
export {};
