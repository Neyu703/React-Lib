import type { ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  /** Optionales Symbol vor der Beschriftung, etwa für eine eingeklappte Seitenleiste. */
  icon?: ReactNode;
  /** Deaktivierte Tabs bleiben sichtbar. */
  disabled?: boolean;
  /** Hinweis zur Verwendung oder zum Grund für die Sperre. */
  title?: string;
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
  orientation?: "horizontal" | "vertical";
  className?: string;
  /** Auswahl einer bereits von der App gesteuerten Navigation. */
  activeTab?: string;
  onTabChange?: (id: string) => void;
}
