import type { ReactNode } from "react";

/** Small "i" tooltip next to headings. */
export function InfoTip({ children }: { children: ReactNode }) {
  return (
    <span
      className="info-tip"
      aria-label="Info"
    >
      <span
        className="info-tip-text"
        role="tooltip"
      >
        {children}
      </span>
    </span>
  );
}
