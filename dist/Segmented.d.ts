/** Equal-width option buttons with a thumb that slides under the pressed one (hidden when none is pressed). */
export declare function Segmented({ label, options, value, onPick, id, }: {
    label: string;
    /** [value, text, tooltip?] */
    options: [string, string, string?][];
    value: string;
    onPick: (value: string) => void;
    id: string;
}): import("react").JSX.Element;
