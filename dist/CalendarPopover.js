import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { isoWeekOf, pad } from "./dates.js";
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
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const isoOf = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;
const todayIso = () => {
    const now = new Date();
    return isoOf(now.getFullYear(), now.getMonth(), now.getDate());
};
function viewOf(iso) {
    const match = /^(\d{4})-(\d{2})/.exec(iso);
    if (match)
        return { year: Number(match[1]), month: Number(match[2]) - 1 };
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
}
/** Month calendar in a popover (shared by DateField and WeekField). It starts on the month of `value` each time it opens. */
export function CalendarPopover({ popoverRef, position, value, min, required, weekly, label, onPick, }) {
    const [shown, setShown] = useState(() => viewOf(value));
    const shiftMonth = (offset) => setShown(({ year, month }) => {
        const moved = new Date(year, month + offset, 1);
        return { year: moved.getFullYear(), month: moved.getMonth() };
    });
    const firstWeekday = (new Date(shown.year, shown.month, 1).getDay() + 6) % 7;
    const dayCount = new Date(shown.year, shown.month + 1, 0).getDate();
    const today = todayIso();
    const selectedWeek = weekly && value ? isoWeekOf(value) : "";
    const before = (iso) => min !== undefined && min !== "" && iso < min;
    return (_jsxs("div", { ref: popoverRef, className: "calendar-popover", role: "dialog", "aria-label": label, style: position, children: [_jsxs("div", { className: "calendar-head", children: [_jsx("button", { type: "button", "aria-label": "Vorheriger Monat", onClick: () => shiftMonth(-1), children: "\u2039" }), _jsxs("strong", { children: [MONTHS[shown.month], " ", shown.year] }), _jsx("button", { type: "button", "aria-label": "N\u00E4chster Monat", onClick: () => shiftMonth(1), children: "\u203A" })] }), _jsxs("div", { className: "calendar-grid", children: [WEEKDAYS.map((name) => (_jsx("span", { className: "calendar-weekday", children: name }, name))), Array.from({ length: firstWeekday }, (_, index) => (_jsx("span", {}, `gap-${index}`))), Array.from({ length: dayCount }, (_, index) => {
                        const iso = isoOf(shown.year, shown.month, index + 1);
                        const selected = weekly
                            ? selectedWeek !== "" && isoWeekOf(iso) === selectedWeek
                            : iso === value;
                        return (_jsx("button", { type: "button", disabled: before(iso), className: `calendar-day${selected ? " selected" : ""}${iso === today ? " today" : ""}`, onClick: () => onPick(iso), children: index + 1 }, iso));
                    })] }), _jsxs("div", { className: "calendar-foot", children: [!required ? (_jsx("button", { type: "button", onClick: () => onPick(""), children: "L\u00F6schen" })) : (_jsx("span", {})), _jsx("button", { type: "button", disabled: before(today), onClick: () => onPick(today), children: weekly ? "Diese Woche" : "Heute" })] })] }));
}
