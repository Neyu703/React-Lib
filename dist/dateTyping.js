const SEPARATOR = /[.\-/\s,]/;
const DIGIT = /\d/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
/** Highest value of the day (field 0) and month (field 1). */
const limitAt = (index) => (index === 0 ? 31 : 12);
/**
 * Splits typed text into day, month and year digits. `at` is the field being typed; fields before it are complete.
 * A first digit that cannot start a valid value gets a zero in front ("9" → "09"), a second digit that makes the value
 * invalid ("35") starts the next field instead ("03", "5"), and a typed separator completes a one-digit field ("1." → "01").
 */
function splitFields(raw) {
    const fields = ["", "", ""];
    const fieldAt = (index) => fields.slice(index, index + 1).join("");
    let at = 0;
    for (const char of raw) {
        if (SEPARATOR.test(char)) {
            if (at < 2 && fields[at]) {
                fields[at] = fieldAt(at).padStart(2, "0");
                at += 1;
            }
            continue;
        }
        let pending = DIGIT.test(char) ? char : null;
        while (pending !== null) {
            const digit = pending;
            pending = null;
            if (at === 2) {
                if (fieldAt(2).length < 4)
                    fields[2] += digit;
                continue;
            }
            const current = fieldAt(at);
            if (current === "") {
                fields[at] = Number(digit) * 10 > limitAt(at) ? `0${digit}` : digit;
                if (fieldAt(at).length === 2)
                    at += 1;
            }
            else if (Number(current + digit) >= 1 && Number(current + digit) <= limitAt(at)) {
                fields[at] = current + digit;
                at += 1;
            }
            else if (current !== "0") {
                fields[at] = `0${current}`;
                at += 1;
                pending = digit;
            } // "00" is neither a day nor a month: the digit is dropped
        }
    }
    return { fields, at };
}
/** What the input shows while typing: "01012026" → "01.01.2026", "9102026" → "09.10.2026". */
export function autoDateText(raw) {
    const { fields, at } = splitFields(raw.replace(ISO_DATE, "$3.$2.$1"));
    return fields.map((field, index) => (index < at ? `${field}.` : field)).join("");
}
/** Typed text as TT.MM.JJJJ for the final check; a missing year is the current one, "26" is 2026. "" when day or month is missing. */
export function completeDateText(raw) {
    const [day = "", month = "", typedYear = ""] = splitFields(raw.replace(ISO_DATE, "$3.$2.$1")).fields.map((field, index) => (index < 2 ? field.padStart(2, "0") : field));
    if (day === "00" || month === "00")
        return "";
    const year = typedYear === ""
        ? String(new Date().getFullYear())
        : typedYear.length === 2
            ? `20${typedYear}`
            : typedYear;
    return year.length === 4 ? `${day}.${month}.${year}` : "";
}
