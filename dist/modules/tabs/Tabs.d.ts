import type { TabsProps } from "./types.js";
/** The active tab id of `group`, or `fallback` until a tab was picked. */
export declare const useActiveTab: (group: string, fallback: string) => string;
/** A tab bar that keeps its selection in the store (`tabs` slice); read it elsewhere with `useActiveTab`. */
export declare function Tabs({ group, tabs, defaultTab, label }: TabsProps): import("react").JSX.Element;
