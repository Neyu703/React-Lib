import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Wheel } from "../Wheel.js";

const ITEM = 36;

const scrollTo = vi.fn();
const scrollBy = vi.fn();
const setPointerCapture = vi.fn();
const releasePointerCapture = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  Object.assign(Element.prototype, { scrollTo, scrollBy, setPointerCapture, releasePointerCapture });
});
afterEach(() => {
  vi.useRealTimers();
  scrollTo.mockReset();
  scrollBy.mockReset();
  setPointerCapture.mockReset();
  releasePointerCapture.mockReset();
  for (const name of ["scrollTo", "scrollBy", "setPointerCapture", "releasePointerCapture"])
    delete (Element.prototype as unknown as Record<string, unknown>)[name];
});

const setup = (count = 24, value = 5) => {
  const onSelect = vi.fn<(value: number) => void>();
  const view = render(
    <Wheel
      count={count}
      value={value}
      label="Stunde"
      onSelect={onSelect}
    />,
  );
  const wheel = screen.getByRole("spinbutton", { name: "Stunde" });
  return { onSelect, wheel, view };
};
/** jsdom has no layout: scrollTop is a plain property, so a test "scrolls" by assigning it. */
const scrollToIndex = (wheel: HTMLElement, index: number): void => {
  wheel.scrollTop = index * ITEM;
  fireEvent.scroll(wheel);
};

describe("Wheel rendering", () => {
  it("renders five copies of the zero-padded numbers with spinbutton aria", () => {
    const { wheel } = setup(24, 5);
    expect(wheel.querySelectorAll(".time-wheel-item")).toHaveLength(5 * 24);
    expect(wheel.querySelectorAll(".time-wheel-item")[25]?.textContent).toBe("01");
    expect(wheel).toHaveAttribute("aria-valuenow", "5");
    expect(wheel).toHaveAttribute("aria-valuemin", "0");
    expect(wheel).toHaveAttribute("aria-valuemax", "23");
    expect(wheel).toHaveAttribute("tabindex", "0");
  });

  it("starts centred on the value in the middle copy", () => {
    const { wheel } = setup(24, 5);
    expect(wheel.scrollTop).toBe((2 * 24 + 5) * ITEM);
  });
});

describe("Wheel scrolling", () => {
  it("reports the number it settled on after the scroll stops", () => {
    const { wheel, onSelect } = setup(24, 5);
    scrollToIndex(wheel, 2 * 24 + 9);
    expect(onSelect).not.toHaveBeenCalled();
    vi.advanceTimersByTime(120);
    expect(onSelect).toHaveBeenCalledWith(9);
    expect(wheel.scrollTop).toBe((2 * 24 + 9) * ITEM); // still in the middle copies: untouched
  });

  it("restarts the settle timer on every scroll event", () => {
    const { wheel, onSelect } = setup(24, 5);
    scrollToIndex(wheel, 2 * 24 + 6);
    vi.advanceTimersByTime(100);
    scrollToIndex(wheel, 2 * 24 + 7);
    vi.advanceTimersByTime(100);
    expect(onSelect).not.toHaveBeenCalled();
    vi.advanceTimersByTime(20);
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(7);
  });

  it("re-centres on the middle copy after running into the first copy", () => {
    const { wheel, onSelect } = setup(24, 5);
    scrollToIndex(wheel, 3); // before the second copy
    vi.advanceTimersByTime(120);
    expect(onSelect).toHaveBeenCalledWith(3);
    expect(wheel.scrollTop).toBe((2 * 24 + 3) * ITEM);
  });

  it("re-centres after running into the last copy", () => {
    const { wheel, onSelect } = setup(24, 5);
    scrollToIndex(wheel, 4 * 24 + 10);
    vi.advanceTimersByTime(120);
    expect(onSelect).toHaveBeenCalledWith(10);
    expect(wheel.scrollTop).toBe((2 * 24 + 10) * ITEM);
  });

  it("does not select anything while dragging", () => {
    const { wheel, onSelect } = setup();
    fireEvent.pointerDown(wheel, { button: 0, clientY: 100, pointerId: 1 });
    scrollToIndex(wheel, 2 * 24 + 8);
    vi.advanceTimersByTime(120);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("clears a pending settle on unmount", () => {
    const { wheel, onSelect, view } = setup();
    scrollToIndex(wheel, 2 * 24 + 8);
    view.unmount();
    vi.advanceTimersByTime(500);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("Wheel mouse wheel", () => {
  it("moves one number per notch (deltaY 100 = 2 steps of 50) and prevents page scrolling", () => {
    const { wheel } = setup(24, 5);
    const notPrevented = fireEvent.wheel(wheel, { deltaY: 50 });
    expect(notPrevented).toBe(false);
    expect(scrollTo).toHaveBeenCalledWith({ top: (2 * 24 + 5 + 1) * ITEM, behavior: "smooth" });
  });

  it("accumulates small trackpad deltas until they make a step", () => {
    const { wheel } = setup(24, 5);
    fireEvent.wheel(wheel, { deltaY: 20 });
    fireEvent.wheel(wheel, { deltaY: 20 });
    expect(scrollTo).not.toHaveBeenCalled();
    fireEvent.wheel(wheel, { deltaY: 20 });
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: (2 * 24 + 5 + 1) * ITEM, behavior: "smooth" });
  });

  it("keeps counting from the previous target while a smooth scroll is still running", () => {
    const { wheel } = setup(24, 5);
    fireEvent.wheel(wheel, { deltaY: 100 });
    fireEvent.wheel(wheel, { deltaY: -50 });
    expect(scrollTo).toHaveBeenNthCalledWith(1, { top: (53 + 2) * ITEM, behavior: "smooth" });
    expect(scrollTo).toHaveBeenNthCalledWith(2, { top: (53 + 1) * ITEM, behavior: "smooth" });
  });

  it("starts from the real position again after the wheel settled", () => {
    const { wheel } = setup(24, 5);
    fireEvent.wheel(wheel, { deltaY: 50 });
    scrollToIndex(wheel, 2 * 24 + 10);
    vi.advanceTimersByTime(120);
    fireEvent.wheel(wheel, { deltaY: 50 });
    expect(scrollTo).toHaveBeenLastCalledWith({ top: (2 * 24 + 11) * ITEM, behavior: "smooth" });
  });

  it("stops listening after unmount", () => {
    const { wheel, view } = setup();
    view.unmount();
    fireEvent.wheel(wheel, { deltaY: 100 });
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe("Wheel keyboard", () => {
  it("ArrowUp and ArrowDown scroll by one number", () => {
    const { wheel } = setup();
    expect(fireEvent.keyDown(wheel, { key: "ArrowUp" })).toBe(false);
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -ITEM, behavior: "smooth" });
    expect(fireEvent.keyDown(wheel, { key: "ArrowDown" })).toBe(false);
    expect(scrollBy).toHaveBeenLastCalledWith({ top: ITEM, behavior: "smooth" });
  });

  it("ignores other keys", () => {
    const { wheel } = setup();
    expect(fireEvent.keyDown(wheel, { key: "a" })).toBe(true);
    expect(scrollBy).not.toHaveBeenCalled();
  });
});

describe("Wheel pointer", () => {
  const rectTop = (wheel: HTMLElement, top: number): void => {
    wheel.getBoundingClientRect = () => ({ top }) as DOMRect;
  };

  it("ignores presses with another button than the primary one", () => {
    const { wheel } = setup();
    fireEvent.pointerDown(wheel, { button: 2, clientY: 10, pointerId: 1 });
    expect(setPointerCapture).not.toHaveBeenCalled();
    expect(wheel.style.scrollSnapType).toBe("");
  });

  it("drags the list with the pointer, with snapping off", () => {
    const { wheel } = setup(24, 5);
    const start = wheel.scrollTop;
    fireEvent.pointerDown(wheel, { button: 0, clientY: 100, pointerId: 7 });
    expect(setPointerCapture).toHaveBeenCalledWith(7);
    expect(wheel.style.scrollSnapType).toBe("none");
    fireEvent.pointerMove(wheel, { clientY: 60 });
    expect(wheel.scrollTop).toBe(start + 40);
  });

  it("ignores pointer movement and release without a press", () => {
    const { wheel } = setup(24, 5);
    const start = wheel.scrollTop;
    fireEvent.pointerMove(wheel, { clientY: 60 });
    fireEvent.pointerUp(wheel, { clientY: 60, pointerId: 1 });
    expect(wheel.scrollTop).toBe(start);
    expect(releasePointerCapture).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("after a real drag it snaps to the nearest number and settles", () => {
    const { wheel, onSelect } = setup(24, 5);
    fireEvent.pointerDown(wheel, { button: 0, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(wheel, { clientY: 40 });
    fireEvent.pointerUp(wheel, { clientY: 40, pointerId: 1 });
    expect(releasePointerCapture).toHaveBeenCalledWith(1);
    expect(wheel.style.scrollSnapType).toBe("");
    const index = Math.round(wheel.scrollTop / ITEM);
    expect(scrollTo).toHaveBeenCalledWith({ top: index * ITEM, behavior: "smooth" });
    vi.advanceTimersByTime(249);
    expect(onSelect).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onSelect).toHaveBeenCalledWith(index % 24);
  });

  it("a click (no movement) jumps to the clicked row relative to the centre band", () => {
    const { wheel, onSelect } = setup(24, 5);
    rectTop(wheel, 20);
    const index = 2 * 24 + 5;
    // row 4 of the visible list (clientY - top = 4.5 rows) is two rows below the centre band
    fireEvent.pointerDown(wheel, { button: 0, clientY: 20 + 4.5 * ITEM, pointerId: 1 });
    fireEvent.pointerUp(wheel, { clientY: 20 + 4.5 * ITEM, pointerId: 1 });
    expect(scrollTo).toHaveBeenCalledWith({ top: (index + 2) * ITEM, behavior: "smooth" });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("treats a movement of at most 4px as a click", () => {
    const { wheel } = setup(24, 5);
    rectTop(wheel, 0);
    fireEvent.pointerDown(wheel, { button: 0, clientY: 2 * ITEM + 4, pointerId: 1 });
    fireEvent.pointerMove(wheel, { clientY: 2 * ITEM });
    fireEvent.pointerUp(wheel, { clientY: 2 * ITEM, pointerId: 1 });
    const index = Math.round(wheel.scrollTop / ITEM);
    expect(scrollTo).toHaveBeenCalledWith({ top: index * ITEM, behavior: "smooth" });
  });
});
