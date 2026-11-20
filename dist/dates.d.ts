export declare const pad: (value: number) => string;
export declare const parseIso: (iso: string) => Date;
export declare const toIso: (date: Date) => string;
export declare const addDays: (iso: string, days: number) => string;
export declare const mondayOf: (iso: string) => string;
/** ISO week ("2026-W47") of the date; the Thursday of the week decides the year. */
export declare const isoWeekOf: (iso: string) => string;
/** Monday of the ISO week "2026-W47" (4 January is always in week 1). */
export declare const mondayOfIsoWeek: (value: string) => string;
