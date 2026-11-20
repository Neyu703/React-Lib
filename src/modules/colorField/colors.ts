// Excel-like grid: theme colours in the first row, below them lighter (80/60/40 %) and darker (25/50 %) tints, then the standard colours.
const THEME = [
  "#ffffff",
  "#000000",
  "#e7e6e6",
  "#44546a",
  "#4472c4",
  "#ed7d31",
  "#a5a5a5",
  "#ffc000",
  "#5b9bd5",
  "#70ad47",
];

const STANDARD = [
  "#c00000",
  "#ff0000",
  "#ffc000",
  "#ffff00",
  "#92d050",
  "#00b050",
  "#00b0f0",
  "#0070c0",
  "#002060",
  "#7030a0",
];

const GREY_TINTS = ["#f2f2f2", "#d9d9d9", "#bfbfbf", "#a6a6a6", "#808080"]; // white column, darker

const BLACK_TINTS = ["#7f7f7f", "#595959", "#404040", "#262626", "#0d0d0d"]; // black column, lighter

function mix(hex: string, target: number, amount: number): string {
  return `#${[1, 3, 5]
    .map((at) =>
      Math.round(parseInt(hex.slice(at, at + 2), 16) * (1 - amount) + target * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

const tints = (hex: string): string[] => [
  mix(hex, 255, 0.8),
  mix(hex, 255, 0.6),
  mix(hex, 255, 0.4),
  mix(hex, 0, 0.25),
  mix(hex, 0, 0.5),
];

const COLUMNS = THEME.map((hex, at) =>
  at === 0 ? GREY_TINTS : at === 1 ? BLACK_TINTS : tints(hex),
);

export const PRESETS = [
  ...THEME,
  ...(COLUMNS[0] as string[]).map((_, row) => COLUMNS.map((column) => column[row] as string)).flat(),
  ...STANDARD,
];

export const HEX = /^#[0-9a-f]{6}$/i;

/** hue 0–360, saturation and brightness 0–1 */
export type Hsv = [number, number, number];

export function hexToHsv(hex: string): Hsv {
  const [red, green, blue] = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
  const max = Math.max(red, green, blue);
  const spread = max - Math.min(red, green, blue);
  let hue = 0;
  if (spread)
    hue =
      max === red
        ? (green - blue) / spread + (green < blue ? 6 : 0)
        : max === green
          ? (blue - red) / spread + 2
          : (red - green) / spread + 4;
  return [hue * 60, max ? spread / max : 0, max];
}

export function hsvToHex([hue, saturation, brightness]: Hsv): string {
  const channel = (offset: number): number => {
    const sector = (offset + hue / 60) % 6;
    return brightness - brightness * saturation * Math.max(0, Math.min(sector, 4 - sector, 1));
  };
  return `#${[channel(5), channel(3), channel(1)]
    .map((part) =>
      Math.round(part * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

export const clamp = (value: number): number => Math.min(1, Math.max(0, value));
