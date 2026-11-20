type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** `[value, label]` pairs. */
  options: readonly (readonly [string, string])[];
  disabled?: boolean;
  className?: string;
};

/** Native select with the lib look; use inside `Float` for a floating label, otherwise `label` is the accessible name. */
export function Select({ id, label, value, onChange, options, disabled, className }: Props) {
  return (
    <select
      id={id}
      className={["select", className ?? ""].filter(Boolean).join(" ")}
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map(([optionValue, optionLabel]) => (
        <option
          key={optionValue}
          value={optionValue}
        >
          {optionLabel}
        </option>
      ))}
    </select>
  );
}
