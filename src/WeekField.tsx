import { useEffect, useRef, useState } from "react";
import { isoWeekOf, mondayOfIsoWeek } from "./dates.js";
import { CalendarPopover } from "./CalendarPopover.js";

const WEEK_TEXT = /^\s*(?:KW\s*)?(\d{1,2})\s*[/.\-\s]\s*(\d{4})\s*$/i;

/** "2026-W07" → "KW 07/2026"; "" for anything else. */
export function formatWeek(value: string): string {
  const match = /^(\d{4})-W(\d{2})$/.exec(value);
  return match ? `KW ${match[2]}/${match[1]}` : "";
}

/** "KW 7/2026", "7/2026" or "07.2026" → "2026-W07"; "" when that ISO week does not exist (week 53 only in long years). */
export function parseWeek(text: string): string {
  const match = WEEK_TEXT.exec(text);
  if (!match) return "";
  const value = `${match[2]}-W${String(match[1]).padStart(2, "0")}`;
  return Number(match[1]) >= 1 && isoWeekOf(mondayOfIsoWeek(value)) === value ? value : "";
}

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
export function WeekField({ value, onChange, id, min, required, disabled }: WeekFieldProps) {
  const [text, setText] = useState(formatWeek(value));
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => setText(formatWeek(value)), [value]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event: Event): void => {
      if (
        !popoverRef.current?.contains(event.target as Node) &&
        !rootRef.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const toggle = (): void => {
    if (!open && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      setPosition({
        top: Math.min(rect.bottom + 6, window.innerHeight - 330),
        left: Math.min(rect.left, window.innerWidth - 260),
      });
    }
    setOpen(!open);
  };
  const choose = (iso: string): void => {
    onChange(iso ? isoWeekOf(iso) : "");
    setOpen(false);
  };
  const commit = (raw: string): void => {
    const week = parseWeek(raw);
    if (week) {
      if (week !== value) onChange(week);
      setText(formatWeek(week));
    } else if (raw.trim() === "") {
      if (value) onChange("");
      setText("");
    } else setText(formatWeek(value));
  };

  return (
    <span
      className="date-field"
      ref={rootRef}
    >
      <input
        type="text"
        id={id}
        required={required}
        disabled={disabled}
        placeholder="KW 12/2026"
        maxLength={10}
        autoComplete="off"
        value={text}
        aria-invalid={text.length >= 6 && !parseWeek(text)}
        onChange={(event) => {
          setText(event.target.value);
          const week = parseWeek(event.target.value);
          if (week && /\d{4}\s*$/.test(event.target.value)) onChange(week);
        }}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && event.altKey) {
            event.preventDefault();
            toggle();
          }
        }}
      />
      <button
        type="button"
        className="date-toggle"
        disabled={disabled}
        aria-label="Kalender öffnen"
        aria-expanded={open}
        onClick={toggle}
      >
        <svg
          viewBox="0 0 16 16"
          width="14"
          height="14"
          aria-hidden="true"
        >
          <rect
            x="1.7"
            y="3"
            width="12.6"
            height="11"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M1.7 6.6h12.6M5 1.5v3M11 1.5v3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {open ? (
        <CalendarPopover
          popoverRef={popoverRef}
          position={position}
          value={value ? mondayOfIsoWeek(value) : ""}
          min={min ? mondayOfIsoWeek(min) : undefined}
          required={required}
          weekly
          label="Woche wählen"
          onPick={choose}
        />
      ) : null}
    </span>
  );
}
