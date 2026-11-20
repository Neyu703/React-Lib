import { useRef } from "react";
import { CloseIcon } from "./icons.js";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Hint inside the empty field; defaults to `label`. */
  placeholder?: string;
  className?: string;
};

export function SearchField({ id, label, value, onChange, placeholder, className }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const clear = (): void => {
    onChange("");
    input.current?.focus();
  };

  return (
    <div className={["search-field", className].filter(Boolean).join(" ")}>
      <svg
        className="search-icon"
        viewBox="0 0 20 20"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle
          cx="8.5"
          cy="8.5"
          r="5.5"
        />
        <path d="m13 13 4 4" />
      </svg>
      <input
        ref={input}
        id={id}
        type="search"
        aria-label={label}
        placeholder={placeholder ?? label}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Escape" || !value) return;
          event.preventDefault();
          event.stopPropagation();
          clear();
        }}
      />
      <button
        type="button"
        className="search-clear"
        aria-label={`${label}: Suche leeren`}
        title="Suche leeren"
        hidden={!value}
        onClick={clear}
      >
        <CloseIcon />
      </button>
    </div>
  );
}
