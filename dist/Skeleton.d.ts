import type { CSSProperties, ReactNode } from "react";
type Size = number | string;
/**
 * One placeholder block: put it wherever content will appear. Size it like the content it stands for (`width`,
 * `height`; numbers are pixels, strings any CSS length). It is decoration only (hidden from screen readers; the
 * region that loads says "Lädt …", see `Loading`), shimmers unless the user prefers reduced motion, and fades in after
 * a short delay, so an answer that arrives quickly never flashes a placeholder.
 */
export declare function Skeleton({ width, height, radius, circle, className, style, }: {
    width?: Size;
    height?: Size;
    radius?: Size;
    /** A round block (avatar, status dot); `width` alone is enough. */
    circle?: boolean;
    className?: string;
    style?: CSSProperties;
}): import("react").JSX.Element;
/** Lines of text; the last one is shorter, like the end of a paragraph. */
export declare function SkeletonLines({ lines, lastWidth, }: {
    lines?: number;
    lastWidth?: Size;
}): import("react").JSX.Element;
/** A grid of blocks for a table, a list or a card row: `columns` blocks per row, `rows` rows. */
export declare function SkeletonGrid({ rows, columns, cellHeight, }: {
    rows?: number;
    columns?: number;
    cellHeight?: Size;
}): import("react").JSX.Element;
/**
 * The one wrapper for anything that loads: shows `fallback` (default: three lines) while `loading`, announced as
 * busy to screen readers, and the children afterwards.
 *
 *     <Loading loading={!data} fallback={<SkeletonGrid rows={5} columns={4} />}>
 *       <Table data={data!} />
 *     </Loading>
 */
export declare function Loading({ loading, fallback, label, children, }: {
    loading: boolean;
    fallback?: ReactNode;
    /** What a screen reader says while it is busy. */
    label?: string;
    children?: ReactNode;
}): import("react").JSX.Element;
/**
 * A placeholder that takes exactly the space of the real thing, so nothing moves when the answer arrives: render the
 * real component with dummy data inside `Ghost`. Its content keeps its size and layout but is invisible and inert;
 * every leaf element (text, input, button, cell) shimmers like a `Skeleton`.
 *
 *     <Ghost label="Plan lädt …"><WeekDiff grid={PLACEHOLDER_GRID} /></Ghost>
 */
export declare function Ghost({ label, children }: {
    label?: string;
    children: ReactNode;
}): import("react").JSX.Element;
export {};
