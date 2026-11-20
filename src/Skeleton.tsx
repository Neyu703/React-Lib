import type { CSSProperties, ReactNode } from "react";

type Size = number | string;

const toCss = (value: Size | undefined): string | undefined =>
  typeof value === "number" ? `${value}px` : value;

/**
 * One placeholder block: put it wherever content will appear. Size it like the content it stands for (`width`,
 * `height`; numbers are pixels, strings any CSS length). It is decoration only (hidden from screen readers; the
 * region that loads says "Lädt …", see `Loading`), shimmers unless the user prefers reduced motion, and fades in after
 * a short delay, so an answer that arrives quickly never flashes a placeholder.
 */
export function Skeleton({
  width,
  height,
  radius,
  circle = false,
  className = "",
  style,
}: {
  width?: Size;
  height?: Size;
  radius?: Size;
  /** A round block (avatar, status dot); `width` alone is enough. */
  circle?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`skeleton${circle ? " skeleton-circle" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      style={{
        width: toCss(width),
        height: toCss(height ?? (circle ? width : undefined)),
        borderRadius: toCss(radius),
        ...style,
      }}
    />
  );
}

/** Lines of text; the last one is shorter, like the end of a paragraph. */
export function SkeletonLines({
  lines = 3,
  lastWidth = "60%",
}: {
  lines?: number;
  lastWidth?: Size;
}) {
  return (
    <div className="skeleton-lines">
      {Array.from({ length: lines }, (_, at) => (
        <Skeleton
          key={at}
          width={at === lines - 1 && lines > 1 ? lastWidth : "100%"}
        />
      ))}
    </div>
  );
}

/** A grid of blocks for a table, a list or a card row: `columns` blocks per row, `rows` rows. */
export function SkeletonGrid({
  rows = 4,
  columns = 1,
  cellHeight = 18,
}: {
  rows?: number;
  columns?: number;
  cellHeight?: Size;
}) {
  return (
    <div
      className="skeleton-grid"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: rows * columns }, (_, at) => (
        <Skeleton
          key={at}
          width="100%"
          height={cellHeight}
        />
      ))}
    </div>
  );
}

/**
 * The one wrapper for anything that loads: shows `fallback` (default: three lines) while `loading`, announced as
 * busy to screen readers, and the children afterwards.
 *
 *     <Loading loading={!data} fallback={<SkeletonGrid rows={5} columns={4} />}>
 *       <Table data={data!} />
 *     </Loading>
 */
export function Loading({
  loading,
  fallback,
  label = "Lädt …",
  children,
}: {
  loading: boolean;
  fallback?: ReactNode;
  /** What a screen reader says while it is busy. */
  label?: string;
  children?: ReactNode;
}) {
  if (!loading) return <>{children}</>;
  return (
    <div
      className="loading"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      {fallback ?? <SkeletonLines />}
    </div>
  );
}

/**
 * A placeholder that takes exactly the space of the real thing, so nothing moves when the answer arrives: render the
 * real component with dummy data inside `Ghost`. Its content keeps its size and layout but is invisible and inert;
 * every leaf element (text, input, button, cell) shimmers like a `Skeleton`.
 *
 *     <Ghost label="Plan lädt …"><WeekDiff grid={PLACEHOLDER_GRID} /></Ghost>
 */
export function Ghost({ label = "Lädt …", children }: { label?: string; children: ReactNode }) {
  return (
    <div
      className="ghost"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <div
        className="ghost-content"
        aria-hidden="true"
        inert
      >
        {children}
      </div>
    </div>
  );
}
