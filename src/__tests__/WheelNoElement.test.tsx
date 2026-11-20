import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Simulates a ref that never gets attached (the guards in Wheel for a missing element).
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  let calls = 0;
  return {
    ...actual,
    useRef: ((initial: unknown) => {
      calls += 1;
      // the first useRef of every Wheel render is the element ref
      if (calls % 4 === 1)
        return {
          get current() {
            return null;
          },
          set current(_value: unknown) {},
        };
      return actual.useRef(initial);
    }) as typeof actual.useRef,
  };
});

const { Wheel } = await import("../Wheel.js");

describe("Wheel without a mounted element", () => {
  it("ignores scroll, keys and pointer events instead of throwing", () => {
    vi.useFakeTimers();
    const onSelect = vi.fn();
    render(
      <Wheel
        count={24}
        value={3}
        label="Stunde"
        onSelect={onSelect}
      />,
    );
    const wheel = screen.getByRole("spinbutton", { name: "Stunde" });
    fireEvent.scroll(wheel);
    vi.advanceTimersByTime(200);
    fireEvent.keyDown(wheel, { key: "ArrowDown" });
    fireEvent.pointerDown(wheel, { button: 0, clientY: 1, pointerId: 1 });
    fireEvent.pointerMove(wheel, { clientY: 5 });
    fireEvent.pointerUp(wheel, { clientY: 5, pointerId: 1 });
    expect(onSelect).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
