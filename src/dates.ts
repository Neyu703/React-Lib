export const pad = (value: number): string => String(value).padStart(2, "0");

export const parseIso = (iso: string): Date => {
  const [year = 0, month = 1, day = 1] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const toIso = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const addDays = (iso: string, days: number): string => {
  const date = parseIso(iso);
  date.setDate(date.getDate() + days);
  return toIso(date);
};

export const mondayOf = (iso: string): string => addDays(iso, -((parseIso(iso).getDay() + 6) % 7));

/** ISO week ("2026-W47") of the date; the Thursday of the week decides the year. */
export const isoWeekOf = (iso: string): string => {
  const thursday = addDays(mondayOf(iso), 3);
  const year = thursday.slice(0, 4);
  const dayOfYear = Math.round(
    (parseIso(thursday).getTime() - parseIso(`${year}-01-01`).getTime()) / 86400000,
  );
  return `${year}-W${pad(Math.floor(dayOfYear / 7) + 1)}`;
};

/** Monday of the ISO week "2026-W47" (4 January is always in week 1). */
export const mondayOfIsoWeek = (value: string): string => {
  const [year, week = 1] = value.split("-W").map(Number);
  return addDays(mondayOf(`${year}-01-04`), (week - 1) * 7);
};
