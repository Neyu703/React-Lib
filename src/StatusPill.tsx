import type { ReactNode } from "react";

export type StatusTone = "ok" | "warn" | "fail" | "neutral";

type Props = {
  tone: StatusTone;
  /** Announce changes to screen readers (role="status"). */
  live?: boolean;
  className?: string;
  children: ReactNode;
};

/** A small coloured pill for a state (ok, warning, failure, neutral). */
export function StatusPill({ tone, live, className, children }: Props) {
  return (
    <span
      role={live ? "status" : undefined}
      className={["status-pill", `status-pill-${tone}`, className ?? ""].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
}
