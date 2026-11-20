import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { PRESETS, HEX, type Hsv, hexToHsv, hsvToHex, clamp } from "./colors.js";
import { customColorsSet } from "./slice.js";
import { reactLibHandlers } from "../../core/host.js";
import { useReactLibDispatch, useReactLibSelector } from "../../core/hooks.js";

interface ColorFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  ariaLabel?: string;
}

/** Swatch button that opens a palette popover: preset grid, own saved colours (custom_colors.json in the data folder),
 *  a mixer (area plus hue slider) and a hex input. onChange fires on release, not on every drag step. */
export function ColorField({ value, onChange, id, name, ariaLabel }: ColorFieldProps) {
  const [open, setOpen] = useState(false);
  const [mixing, setMixing] = useState(false);
  const [hex, setHex] = useState(value);
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));
  const dispatch = useReactLibDispatch();
  const custom = useReactLibSelector((state) => state.colorField.customColors);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHex(value);
    setHsv((current) => (hsvToHex(current) === value.toLowerCase() ? current : hexToHsv(value)));
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;
    reactLibHandlers()
      .loadCustomColors()
      .then((colors) => dispatch(customColorsSet(colors)))
      .catch(() => undefined);
    const close = (event: Event): void => {
      if (
        !popoverRef.current?.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open, dispatch]);

  // keep the popover inside the window when the mixer or a second row of own colours makes it taller
  useLayoutEffect(() => {
    const rect = popoverRef.current?.getBoundingClientRect();
    if (open && rect && rect.bottom > window.innerHeight - 8)
      setPosition((current) => ({
        ...current,
        top: Math.max(8, window.innerHeight - 8 - rect.height),
      }));
  }, [open, mixing, custom.length]);

  const toggle = (): void => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 6, left: Math.min(rect.left, window.innerWidth - 240) });
    }
    setOpen(!open);
  };
  const pick = (color: string): void => {
    onChange(color.toLowerCase());
    setHex(color.toLowerCase());
    setHsv(hexToHsv(color));
  };
  const typeHex = (text: string): void => {
    const next = text.startsWith("#") ? text : `#${text}`;
    setHex(next);
    if (HEX.test(next)) pick(next);
  };

  const saveCustom = (colors: string[]): void => {
    reactLibHandlers()
      .saveCustomColors(colors)
      .then((saved) => dispatch(customColorsSet(saved)))
      .catch(() => undefined);
  };
  const current = HEX.test(hex) ? hex.toLowerCase() : value.toLowerCase();

  const drag = (apply: (x: number, y: number) => Hsv) => {
    const update = (event: ReactPointerEvent<HTMLDivElement>, release: boolean): void => {
      const rect = event.currentTarget.getBoundingClientRect();
      const next = apply(
        clamp((event.clientX - rect.left) / rect.width),
        clamp((event.clientY - rect.top) / rect.height),
      );
      setHsv(next);
      setHex(hsvToHex(next));
      if (release) onChange(hsvToHex(next));
    };
    return {
      onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        update(event, false);
      },
      onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) update(event, false);
      },
      onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => update(event, true),
    };
  };
  const areaHandlers = drag((x, y) => [hsv[0], x, 1 - y]);
  const hueHandlers = drag((x) => [x * 360, hsv[1], hsv[2]]);

  return (
    <span className="color-field">
      <button
        type="button"
        ref={buttonRef}
        id={id}
        data-name={name}
        className="color-swatch"
        style={{ background: value }}
        aria-label={ariaLabel ?? "Farbe wählen"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
      />
      {open ? (
        <div
          ref={popoverRef}
          className="color-popover"
          role="dialog"
          aria-label="Farbe wählen"
          style={position}
          onClick={
            (event) =>
              event.preventDefault() /* inside a <label>, a click on plain areas would otherwise re-click the swatch and close the popover */
          }
        >
          <div className="color-presets">
            {PRESETS.map((color, index) => (
              <button
                key={`${color}-${index}`}
                type="button"
                className={`color-preset${color === value.toLowerCase() ? " on" : ""}`}
                style={{ background: color }}
                aria-label={color}
                onClick={() => pick(color)}
              />
            ))}
          </div>
          <div className="color-custom">
            {custom.map((color) => (
              <span
                key={color}
                className="color-custom-item"
              >
                <button
                  type="button"
                  className={`color-preset${color === value.toLowerCase() ? " on" : ""}`}
                  style={{ background: color }}
                  aria-label={`Eigene Farbe ${color}`}
                  title={color}
                  onClick={() => pick(color)}
                />
                <button
                  type="button"
                  className="color-custom-remove"
                  aria-label={`${color} entfernen`}
                  title="Entfernen"
                  onClick={() => saveCustom(custom.filter((entry) => entry !== color))}
                >
                  ×
                </button>
              </span>
            ))}
            <button
              type="button"
              className="color-preset color-add"
              aria-label="Eigene Farbe mischen"
              title="Eigene Farbe mischen"
              aria-expanded={mixing}
              onClick={() => setMixing(!mixing)}
            >
              +
            </button>
          </div>
          {mixing ? (
            <div className="color-mixer">
              <div className="color-mixer-top">
                <span
                  className="color-mixer-preview"
                  style={{ background: current }}
                />
                <div
                  className="color-area"
                  style={{ backgroundColor: `hsl(${hsv[0]}, 100%, 50%)` }}
                  {...areaHandlers}
                >
                  <i style={{ left: `${hsv[1] * 100}%`, top: `${(1 - hsv[2]) * 100}%` }} />
                </div>
              </div>
              <div
                className="color-hue"
                {...hueHandlers}
              >
                <i style={{ left: `${(hsv[0] / 360) * 100}%` }} />
              </div>
            </div>
          ) : null}
          <div className="color-hex-row">
            <span
              className="color-preview"
              style={{ background: current }}
            />
            <input
              type="text"
              className="color-hex"
              value={hex}
              maxLength={7}
              spellCheck={false}
              aria-label="Hex-Wert"
              aria-invalid={!HEX.test(hex)}
              onChange={(event) => typeHex(event.target.value)}
            />
            <button
              type="button"
              className="color-save"
              disabled={custom.includes(current)}
              title="Diese Farbe unter „Eigene“ speichern"
              onClick={() => saveCustom([current, ...custom])}
            >
              Speichern
            </button>
          </div>
        </div>
      ) : null}
    </span>
  );
}
