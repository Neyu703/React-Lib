export declare const PRESETS: string[];
export declare const HEX: RegExp;
/** hue 0–360, saturation and brightness 0–1 */
export type Hsv = [number, number, number];
export declare function hexToHsv(hex: string): Hsv;
export declare function hsvToHex([hue, saturation, brightness]: Hsv): string;
export declare const clamp: (value: number) => number;
