import { useEffect, useLayoutEffect, useRef } from "react";

const ITEM_HEIGHT = 36;

const COPIES = 5; // the list is repeated so the wheel can spin endlessly; it re-centres on the middle copy after each stop

const WHEEL_STEP = 50; // wheel delta that counts as one step (a notch is 100)

import { pad } from "./dates.js";

interface WheelProps {
  count: number;
  value: number;
  label: string;
  onSelect: (value: number) => void;
}

/** One endless scroll-snap wheel (like the iOS time picker): mouse wheel, drag, click on a number or ↑/↓. */
export function Wheel({ count, value, label, onSelect }: WheelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(0);
  const drag = useRef<{ y: number; top: number } | null>(null);
  const wheel = useRef<{ target: number | null; delta: number }>({ target: null, delta: 0 });

  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = (2 * count + value) * ITEM_HEIGHT;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // One mouse-wheel notch (deltaY ~100) moves exactly one number; small trackpad deltas add up to a step first.
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const onWheel = (event: WheelEvent): void => {
      event.preventDefault();
      wheel.current.delta += event.deltaY;
      const steps = Math.trunc(wheel.current.delta / WHEEL_STEP);
      if (steps === 0) return;
      wheel.current.delta -= steps * WHEEL_STEP;
      wheel.current.target =
        (wheel.current.target ?? Math.round(element.scrollTop / ITEM_HEIGHT)) + steps;
      element.scrollTo({ top: wheel.current.target * ITEM_HEIGHT, behavior: "smooth" });
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  const settle = (): void => {
    const element = ref.current;
    if (!element || drag.current) return;
    wheel.current = { target: null, delta: 0 };
    const index = Math.round(element.scrollTop / ITEM_HEIGHT);
    const selected = ((index % count) + count) % count;
    if (index < count || index >= (COPIES - 1) * count)
      element.scrollTop = (2 * count + selected) * ITEM_HEIGHT;
    onSelect(selected);
  };
  const onScroll = (): void => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(settle, 120);
  };
  const nudge = (steps: number): void =>
    ref.current?.scrollBy({ top: steps * ITEM_HEIGHT, behavior: "smooth" });

  return (
    <div
      ref={ref}
      className="time-wheel"
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={count - 1}
      onScroll={onScroll}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          nudge(-1);
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          nudge(1);
        }
      }}
      onPointerDown={(event) => {
        if (event.button !== 0 || !ref.current) return;
        drag.current = { y: event.clientY, top: ref.current.scrollTop };
        ref.current.style.scrollSnapType = "none";
        ref.current.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (drag.current && ref.current)
          ref.current.scrollTop = drag.current.top - (event.clientY - drag.current.y);
      }}
      onPointerUp={(event) => {
        const element = ref.current;
        if (!element || !drag.current) return;
        const moved = Math.abs(event.clientY - drag.current.y) > 4;
        drag.current = null;
        element.releasePointerCapture(event.pointerId);
        element.style.scrollSnapType = "";
        const index = Math.round(element.scrollTop / ITEM_HEIGHT);
        // a click jumps to the clicked number (row offset from the centre band)
        const offset = moved
          ? 0
          : Math.floor((event.clientY - element.getBoundingClientRect().top) / ITEM_HEIGHT) - 2;
        element.scrollTo({ top: (index + offset) * ITEM_HEIGHT, behavior: "smooth" });
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(settle, 250);
      }}
    >
      {Array.from({ length: COPIES * count }, (_, index) => (
        <div
          key={index}
          className="time-wheel-item"
        >
          {pad(index % count)}
        </div>
      ))}
    </div>
  );
}
