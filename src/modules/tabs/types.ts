import type { ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  /** Optional count or marker shown after the label. */
  badge?: ReactNode;
}

export interface TabsProps {
  /** Name of the tab group; the active tab is stored under it, so several bars can coexist. */
  group: string;
  tabs: TabItem[];
  /** Active tab until the user picks one; defaults to the first tab. */
  defaultTab?: string;
  /** Accessible name of the tab bar. */
  label: string;
}
