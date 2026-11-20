import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { CheckIcon } from "./icons.js";

type Option = { value: string; label: string };
type Props = {
  id: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  onPreview: (value: string | null) => void;
};

export function PreviewSelect({ id, label, value, options, onChange, onPreview }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const selected = options.findIndex((option) => option.value === value);
  const close = (): void => {
    setOpen(false);
    setActive(-1);
    onPreview(null);
  };
  const preview = (at: number): void => {
    setActive(at);
    onPreview(options[at]?.value ?? null);
  };
  const pick = (at: number): void => {
    const option = options[at];
    if (!option) return;
    onChange(option.value);
    close();
    trigger.current?.focus();
  };

  useEffect(() => () => onPreview(null), [onPreview]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent): void => {
      if (root.current?.contains(event.target as Node)) return;
      setOpen(false);
      setActive(-1);
      onPreview(null);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, onPreview]);
  useEffect(() => {
    if (open && active >= 0)
      document.getElementById(`${id}-option-${active}`)?.scrollIntoView?.({ block: "nearest" });
  }, [open, active, id]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === "Tab") {
      close();
      return;
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (!options.length) return;
      const start = open && active >= 0 ? active : Math.max(selected, 0);
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? options.length - 1
            : !open
              ? start
              : (start + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      setOpen(true);
      preview(next);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open && active >= 0) pick(active);
      else {
        setOpen(true);
        preview(Math.max(selected, 0));
      }
    }
  };

  return (
    <div
      className="preview-select"
      ref={root}
      onMouseLeave={() => {
        setActive(-1);
        onPreview(null);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
    >
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        className="preview-select-trigger"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined}
        onKeyDown={onKeyDown}
        onClick={() => {
          if (open) close();
          else {
            setOpen(true);
            preview(Math.max(selected, 0));
          }
        }}
      >
        <span
          className="preview-select-label"
          aria-hidden="true"
        >
          {label}
        </span>
        <span className="preview-select-value">{options[selected]?.label ?? "Alle"}</span>
        <svg
          className="preview-select-arrow"
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {open ? (
        <div
          id={`${id}-options`}
          className="preview-select-options"
          role="listbox"
          aria-label={label}
        >
          {options.map((option, at) => (
            <button
              key={option.value}
              id={`${id}-option-${at}`}
              type="button"
              role="option"
              tabIndex={-1}
              aria-selected={option.value === value}
              className={active === at ? "preview-active" : undefined}
              onMouseEnter={() => preview(at)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(at)}
            >
              <span>{option.label}</span>
              {option.value === value ? <CheckIcon /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
