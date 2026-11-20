/** What the input shows while typing: "01012026" → "01.01.2026", "9102026" → "09.10.2026". */
export declare function autoDateText(raw: string): string;
/** Typed text as TT.MM.JJJJ for the final check; a missing year is the current one, "26" is 2026. "" when day or month is missing. */
export declare function completeDateText(raw: string): string;
