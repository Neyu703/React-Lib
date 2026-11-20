import { useState, type CSSProperties, type RefObject } from "react";
import { isoWeekOf, pad } from "./dates.js";

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const isoOf = (year: number, month: number, day: number): string =>
  `${year}-${pad(month + 1)}-${pad(day)}`;
const todayIso = (): string => {
  const now = new Date();
  return isoOf(now.getFullYear(), now.getMonth(), now.getDate());
};

function viewOf(iso: string): { year: number; month: number } {
  const match = /^(\d{4})-(\d{2})/.exec(iso);
  if (match) return { year: Number(match[1]), month: Number(match[2]) - 1 };
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

interface Props {
  popoverRef: RefObject<HTMLDivElement | null>;
  position: CSSProperties;
  /** Selected day (ISO); the month of it is shown first. With `weekly` its whole week is marked. */
  value: string;
  /** Days before this one (ISO) cannot be picked. */
  min?: string;
  required?: boolean;
  weekly?: boolean;
  label: string;
  onPick: (iso: string) => void;
}

/** Month calendar in a popover (shared by DateField and WeekField). It starts on the month of `value` each time it opens. */
export function CalendarPopover({
  popoverRef,
  position,
  value,
  min,
  required,
  weekly,
  label,
  onPick,
}: Props) {
  const [shown, setShown] = useState(() => viewOf(value));
  const shiftMonth = (offset: number): void =>
    setShown(({ year, month }) => {
      const moved = new Date(year, month + offset, 1);
      return { year: moved.getFullYear(), month: moved.getMonth() };
    });
  const firstWeekday = (new Date(shown.year, shown.month, 1).getDay() + 6) % 7;
  const dayCount = new Date(shown.year, shown.month + 1, 0).getDate();
  const today = todayIso();
  const selectedWeek = weekly && value ? isoWeekOf(value) : "";
  const before = (iso: string): boolean => min !== undefined && min !== "" && iso < min;
  return (
    <div
      ref={popoverRef}
      className="calendar-popover"
      role="dialog"
      aria-label={label}
      style={position}
    >
      <div className="calendar-head">
        <button
          type="button"
          aria-label="Vorheriger Monat"
          onClick={() => shiftMonth(-1)}
        >
          ‹
        </button>
        <strong>
          {MONTHS[shown.month]} {shown.year}
        </strong>
        <button
          type="button"
          aria-label="Nächster Monat"
          onClick={() => shiftMonth(1)}
        >
          ›
        </button>
      </div>
      <div className="calendar-grid">
        {WEEKDAYS.map((name) => (
          <span
            key={name}
            className="calendar-weekday"
          >
            {name}
          </span>
        ))}
        {Array.from({ length: firstWeekday }, (_, index) => (
          <span key={`gap-${index}`} />
        ))}
        {Array.from({ length: dayCount }, (_, index) => {
          const iso = isoOf(shown.year, shown.month, index + 1);
          const selected = weekly
            ? selectedWeek !== "" && isoWeekOf(iso) === selectedWeek
            : iso === value;
          return (
            <button
              key={iso}
              type="button"
              disabled={before(iso)}
              className={`calendar-day${selected ? " selected" : ""}${iso === today ? " today" : ""}`}
              onClick={() => onPick(iso)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="calendar-foot">
        {!required ? (
          <button
            type="button"
            onClick={() => onPick("")}
          >
            Löschen
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          disabled={before(today)}
          onClick={() => onPick(today)}
        >
          {weekly ? "Diese Woche" : "Heute"}
        </button>
      </div>
    </div>
  );
}
