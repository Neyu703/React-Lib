import type { SelectHTMLAttributes } from "react";

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children" | "defaultValue" | "multiple" | "onChange" | "value"> & {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Einträge aus Wert, Beschriftung und optionalem Sperrstatus. */
  options: readonly (readonly [value: string, label: string, disabled?: boolean])[];
};

/** Native select with the lib look; use inside `Float` for a floating label, otherwise `label` is the accessible name. */
export function Select({ id, label, value, onChange, options, className, ...attributes }: Props) {
  return (
    <select
      id={id}
      className={["select", className ?? ""].filter(Boolean).join(" ")}
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      {...attributes}
    >
      {options.map(([optionValue, optionLabel, disabled]) => (
        <option
          key={optionValue}
          value={optionValue}
          disabled={disabled}
        >
          {optionLabel}
        </option>
      ))}
    </select>
  );
}
