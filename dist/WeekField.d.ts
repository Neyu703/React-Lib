/** "2026-W07" → "KW 07/2026"; "" for anything else. */
export declare function formatWeek(value: string): string;
/** "KW 7/2026", "7/2026" or "07.2026" → "2026-W07"; "" when that ISO week does not exist (week 53 only in long years). */
export declare function parseWeek(text: string): string;
interface WeekFieldProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    min?: string;
    required?: boolean;
    disabled?: boolean;
}
/** Text input for "KW 12/2026" plus a calendar popover where a click on any day picks its week (replaces `<input type="week">`).
 *  Value is the ISO week "yyyy-Www" or "". Looks like DateField. */
export declare function WeekField({ value, onChange, id, min, required, disabled }: WeekFieldProps): import("react").JSX.Element;
export {};
