import type { KeyboardEvent } from "react";
import { useReactLibDispatch, useReactLibSelector } from "../../core/hooks.js";
import { tabSelected } from "./slice.js";
import type { TabsProps } from "./types.js";

/** The active tab id of `group`, or `fallback` until a tab was picked. */
export const useActiveTab = (group: string, fallback: string): string =>
  useReactLibSelector((state) => state.tabs.active[group] ?? fallback);

/** Index of the tab a navigation key moves to; undefined for any other key. */
function targetIndex(key: string, index: number, count: number, vertical: boolean): number | undefined {
  if (key === (vertical ? "ArrowDown" : "ArrowRight")) return (index + 1) % count;
  if (key === (vertical ? "ArrowUp" : "ArrowLeft")) return (index - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return undefined;
}

/** A tab bar that keeps its selection in the store (`tabs` slice); read it elsewhere with `useActiveTab`. */
export function Tabs({ group, tabs, defaultTab, label, orientation = "horizontal", className, activeTab, onTabChange }: TabsProps) {
  const dispatch = useReactLibDispatch();
  const firstEnabled = tabs.find((tab) => !tab.disabled)?.id ?? "";
  const storedActive = useActiveTab(group, defaultTab ?? firstEnabled);
  const requested = activeTab ?? storedActive;
  const active = tabs.some((tab) => tab.id === requested && !tab.disabled) ? requested : firstEnabled;
  const select = (id: string): void => {
    if (activeTab === undefined) dispatch(tabSelected({ group, tab: id }));
    onTabChange?.(id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    const buttons = Array.from(event.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>(
      'button[role="tab"]:not([aria-disabled="true"])',
    ));
    const index = buttons.indexOf(event.currentTarget);
    if (index === -1) return;
    const target = targetIndex(event.key, index, buttons.length, orientation === "vertical");
    if (target === undefined) return;
    event.preventDefault();
    const button = buttons[target]!;
    select(button.dataset.tab!);
    button.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation={orientation}
      className={className ? `tabs ${className}` : "tabs"}
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${group}-${tab.id}`}
            data-tab={tab.id}
            aria-selected={selected}
            aria-disabled={tab.disabled || undefined}
            tabIndex={selected ? 0 : -1}
            className="tab"
            title={tab.title}
            onClick={() => { if (!tab.disabled) select(tab.id); }}
            onKeyDown={onKeyDown}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge === undefined ? null : <span className="tab-badge">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
