interface WheelProps {
    count: number;
    value: number;
    label: string;
    onSelect: (value: number) => void;
}
/** One endless scroll-snap wheel (like the iOS time picker): mouse wheel, drag, click on a number or ↑/↓. */
export declare function Wheel({ count, value, label, onSelect }: WheelProps): import("react").JSX.Element;
export {};
