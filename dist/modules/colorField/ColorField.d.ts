interface ColorFieldProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    name?: string;
    ariaLabel?: string;
}
/** Swatch button that opens a palette popover: preset grid, own saved colours (custom_colors.json in the data folder),
 *  a mixer (area plus hue slider) and a hex input. onChange fires on release, not on every drag step. */
export declare function ColorField({ value, onChange, id, name, ariaLabel }: ColorFieldProps): import("react").JSX.Element;
export {};
