import { useEffect, useRef, useState } from "react";
import { pad } from "./dates.js";
import { Wheel } from "./Wheel.js";

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

interface TimeFieldProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
}

/** Time field without free typing: click opens two endless wheels (hours, minutes), so only valid HH:MM values are possible. */
export function TimeField({ value, onChange, name, required }: TimeFieldProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [draft, setDraft] = useState({ hour: 0, minute: 0 });
  const rootRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

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
        top: Math.min(rect.bottom + 6, window.innerHeight - 270),
        left: Math.min(rect.left, window.innerWidth - 220),
      });
      const [hour = 0, minute = 0] = TIME.test(value) ? value.split(":").map(Number) : [0, 0];
      setDraft({ hour, minute });
    }
    setOpen(!open);
  };
  const update = (next: { hour: number; minute: number }): void => {
    setDraft(next);
    onChange(`${pad(next.hour)}:${pad(next.minute)}`);
  };

  return (
    <span
      className="time-field"
      ref={rootRef}
    >
      <input
        type="text"
        name={name}
        required={required}
        readOnly
        placeholder=" "
        autoComplete="off"
        value={value}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
            event.preventDefault();
            if (!open) toggle();
          }
        }}
      />
      <button
        type="button"
        className="time-toggle"
        tabIndex={-1}
        aria-label="Uhrzeit wählen"
        aria-expanded={open}
        onClick={toggle}
      >
        <svg
          viewBox="0 0 16 16"
          width="14"
          height="14"
          aria-hidden="true"
        >
          <circle
            cx="8"
            cy="8"
            r="6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M8 4.5V8l2.5 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {open ? (
        <div
          ref={popoverRef}
          className="time-popover"
          role="dialog"
          aria-label="Uhrzeit wählen"
          style={position}
          onClick={
            (event) =>
              event.preventDefault() /* inside a <label>, a click on a wheel would otherwise be forwarded to the input and toggle the popover */
          }
        >
          <div className="time-wheels">
            <div
              className="time-band"
              aria-hidden="true"
            />
            <Wheel
              count={24}
              value={draft.hour}
              label="Stunde"
              onSelect={(hour) => {
                if (hour !== draft.hour) update({ ...draft, hour });
              }}
            />
            <span
              className="time-colon"
              aria-hidden="true"
            >
              :
            </span>
            <Wheel
              count={60}
              value={draft.minute}
              label="Minute"
              onSelect={(minute) => {
                if (minute !== draft.minute) update({ ...draft, minute });
              }}
            />
          </div>
          <div className="calendar-foot">
            {!required && value ? (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                Löschen
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => {
                update(draft);
                setOpen(false);
              }}
            >
              Fertig
            </button>
          </div>
        </div>
      ) : null}
    </span>
  );
}
