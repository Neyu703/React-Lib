import type { KeyboardEvent } from "react";
import { useReactLibDispatch, useReactLibSelector } from "../../core/hooks.js";
import { tabSelected } from "./slice.js";
import type { TabsProps } from "./types.js";

/** The active tab id of `group`, or `fallback` until a tab was picked. */
export const useActiveTab = (group: string, fallback: string): string =>
  useReactLibSelector((state) => state.tabs.active[group] ?? fallback);

/** Index of the tab a navigation key moves to; undefined for any other key. */
function targetIndex(key: string, index: number, count: number): number | undefined {
  if (key === "ArrowRight") return (index + 1) % count;
  if (key === "ArrowLeft") return (index - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return undefined;
}

/** A tab bar that keeps its selection in the store (`tabs` slice); read it elsewhere with `useActiveTab`. */
export function Tabs({ group, tabs, defaultTab, label }: TabsProps) {
  const dispatch = useReactLibDispatch();
  const active = useActiveTab(group, defaultTab ?? tabs[0]?.id ?? "");
  const select = (tab: string): void => {
    dispatch(tabSelected({ group, tab }));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const target = targetIndex(event.key, index, tabs.length);
    if (target === undefined) return;
    event.preventDefault();
    select((tabs[target] as (typeof tabs)[number]).id);
    (event.currentTarget.parentElement?.children[target] as HTMLElement).focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className="tabs"
    >
      {tabs.map((tab, index) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${group}-${tab.id}`}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className="tab"
            onClick={() => select(tab.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {tab.label}
            {tab.badge === undefined ? null : <span className="tab-badge">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
