/** Equal-width option buttons with a thumb that slides under the pressed one (hidden when none is pressed). */
export function Segmented({
  label,
  options,
  value,
  onPick,
  id,
}: {
  label: string;
  /** [value, text, tooltip?] */
  options: [string, string, string?][];
  value: string;
  onPick: (value: string) => void;
  id: string;
}) {
  const at = options.findIndex(([key]) => key === value);
  return (
    <div
      id={id}
      className="segmented"
      role="group"
      aria-label={label}
      data-count={options.length}
      data-at={at}
    >
      {options.map(([key, text, hint]) => (
        <button
          key={key}
          type="button"
          title={hint}
          aria-pressed={value === key}
          onClick={() => onPick(key)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
