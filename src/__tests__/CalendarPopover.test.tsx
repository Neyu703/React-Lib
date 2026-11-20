import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { CalendarPopover } from "../CalendarPopover.js";

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];
const pad = (number: number): string => String(number).padStart(2, "0");
const now = new Date();
const todayIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

type Props = Partial<Parameters<typeof CalendarPopover>[0]>;
const setup = (props: Props = {}) => {
  const onPick = vi.fn<(iso: string) => void>();
  render(
    <CalendarPopover
      popoverRef={createRef<HTMLDivElement>()}
      position={{ top: 1, left: 2 }}
      value=""
      label="Datum wählen"
      onPick={onPick}
      {...props}
    />,
  );
  return { onPick };
};
const days = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>(".calendar-day"));
const selectedDays = (): string[] =>
  days()
    .filter((day) => day.classList.contains("selected"))
    .map((day) => day.textContent ?? "");

describe("CalendarPopover", () => {
  it("shows the month of the value, marks only that day and reports a picked day", async () => {
    const { onPick } = setup({ value: "2026-03-10" });
    expect(screen.getByRole("dialog", { name: "Datum wählen" })).toHaveStyle({
      top: "1px",
      left: "2px",
    });
    expect(screen.getByText("März 2026")).toBeInTheDocument();
    expect(days()).toHaveLength(31);
    expect(selectedDays()).toEqual(["10"]);
    await userEvent.click(days()[11]);
    expect(onPick).toHaveBeenCalledWith("2026-03-12");
  });

  it("starts on the current month without a value and marks today", () => {
    setup();
    expect(screen.getByText(`${MONTHS[now.getMonth()]} ${now.getFullYear()}`)).toBeInTheDocument();
    expect(selectedDays()).toEqual([]);
    expect(document.querySelectorAll(".calendar-day.today")).toHaveLength(1);
  });

  it("navigates months and wraps over the year boundary", async () => {
    setup({ value: "2026-01-15" });
    await userEvent.click(screen.getByRole("button", { name: "Vorheriger Monat" }));
    expect(screen.getByText("Dezember 2025")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Nächster Monat" }));
    await userEvent.click(screen.getByRole("button", { name: "Nächster Monat" }));
    expect(screen.getByText("Februar 2026")).toBeInTheDocument();
    expect(selectedDays()).toEqual([]);
  });

  it("weekly: marks the whole ISO week of the value", () => {
    setup({ value: "2026-03-11", weekly: true });
    expect(selectedDays()).toEqual(["9", "10", "11", "12", "13", "14", "15"]);
  });

  it("weekly: a week spanning two months is marked in the shown month only", () => {
    setup({ value: "2026-04-01", weekly: true }); // week 30.03.-05.04.
    expect(selectedDays()).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("weekly without a value marks nothing", () => {
    setup({ weekly: true });
    expect(selectedDays()).toEqual([]);
  });

  it("disables days before min", () => {
    setup({ value: "2026-03-10", min: "2026-03-05" });
    expect(
      days()
        .filter((day) => (day as HTMLButtonElement).disabled)
        .map((day) => day.textContent),
    ).toEqual(["1", "2", "3", "4"]);
  });

  it("an empty min disables nothing", () => {
    setup({ value: "2026-03-10", min: "" });
    expect(days().some((day) => (day as HTMLButtonElement).disabled)).toBe(false);
  });

  it("'Heute' picks today and 'Löschen' clears", async () => {
    const { onPick } = setup({ value: "2026-03-10" });
    await userEvent.click(screen.getByRole("button", { name: "Heute" }));
    expect(onPick).toHaveBeenLastCalledWith(todayIso);
    await userEvent.click(screen.getByRole("button", { name: "Löschen" }));
    expect(onPick).toHaveBeenLastCalledWith("");
  });

  it("required hides 'Löschen'", () => {
    setup({ required: true });
    expect(screen.queryByRole("button", { name: "Löschen" })).toBeNull();
  });

  it("weekly labels the today button 'Diese Woche'", async () => {
    const { onPick } = setup({ weekly: true });
    await userEvent.click(screen.getByRole("button", { name: "Diese Woche" }));
    expect(onPick).toHaveBeenCalledWith(todayIso);
    expect(screen.queryByRole("button", { name: "Heute" })).toBeNull();
  });

  it("disables the today button when min lies in the future", () => {
    setup({ min: "2999-01-01" });
    expect(screen.getByRole("button", { name: "Heute" })).toBeDisabled();
  });
});
