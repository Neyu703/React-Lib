/** "2026-03-07" → "07.03.2026"; "" for anything else. */
export declare function formatDate(iso: string): string;
/** "7.3.2026" or "07.03.2026" → "2026-03-07"; "" when not a real calendar date. */
export declare function parseDate(text: string): string;
interface DateFieldProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    min?: string;
    required?: boolean;
    disabled?: boolean;
}
/** Text input for TT.MM.JJJJ plus a calendar popover (replaces the native date picker). Value is ISO yyyy-mm-dd or "". */
export declare function DateField({ value, onChange, id, min, required, disabled }: DateFieldProps): import("react").JSX.Element;
export {};
