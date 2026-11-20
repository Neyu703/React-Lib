import { describe, expect, it } from "vitest";
import { PRESETS, HEX, clamp, hexToHsv, hsvToHex } from "../../../modules/colorField/colors.js";

describe("PRESETS", () => {
  it("holds the theme row, five tint rows and the standard colours", () => {
    expect(PRESETS).toHaveLength(10 + 50 + 10);
    expect(PRESETS.slice(0, 2)).toEqual(["#ffffff", "#000000"]);
    expect(PRESETS[10]).toBe("#f2f2f2");
    expect(PRESETS[11]).toBe("#7f7f7f");
    expect(PRESETS.every((color) => HEX.test(color))).toBe(true);
  });
});

describe("hexToHsv and hsvToHex", () => {
  it.each([
    ["#ff0000", [0, 1, 1]],
    ["#00ff00", [120, 1, 1]],
    ["#0000ff", [240, 1, 1]],
    ["#ff0080", [330, 1, 1]],
    ["#000000", [0, 0, 0]],
    ["#808080", [0, 0, 128 / 255]],
  ])("converts %s", (hex, expected) => {
    const [hue, saturation, brightness] = hexToHsv(hex);
    expect(hue).toBeCloseTo(expected[0] as number, 0);
    expect(saturation).toBeCloseTo(expected[1] as number);
    expect(brightness).toBeCloseTo(expected[2] as number);
  });

  it("round-trips every preset", () => {
    PRESETS.forEach((color) => expect(hsvToHex(hexToHsv(color))).toBe(color));
  });

  it("pads small channels", () => {
    expect(hsvToHex([0, 0, 0])).toBe("#000000");
  });
});

describe("clamp", () => {
  it("limits to 0..1", () => {
    expect([clamp(-1), clamp(0.4), clamp(2)]).toEqual([0, 0.4, 1]);
  });
});
