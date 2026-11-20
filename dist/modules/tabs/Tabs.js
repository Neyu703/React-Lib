import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReactLibDispatch, useReactLibSelector } from "../../core/hooks.js";
import { tabSelected } from "./slice.js";
/** The active tab id of `group`, or `fallback` until a tab was picked. */
export const useActiveTab = (group, fallback) => useReactLibSelector((state) => state.tabs.active[group] ?? fallback);
/** Index of the tab a navigation key moves to; undefined for any other key. */
function targetIndex(key, index, count, vertical) {
    if (key === (vertical ? "ArrowDown" : "ArrowRight"))
        return (index + 1) % count;
    if (key === (vertical ? "ArrowUp" : "ArrowLeft"))
        return (index - 1 + count) % count;
    if (key === "Home")
        return 0;
    if (key === "End")
        return count - 1;
    return undefined;
}
/** A tab bar that keeps its selection in the store (`tabs` slice); read it elsewhere with `useActiveTab`. */
export function Tabs({ group, tabs, defaultTab, label, orientation = "horizontal", className, activeTab, onTabChange }) {
    const dispatch = useReactLibDispatch();
    const firstEnabled = tabs.find((tab) => !tab.disabled)?.id ?? "";
    const storedActive = useActiveTab(group, defaultTab ?? firstEnabled);
    const requested = activeTab ?? storedActive;
    const active = tabs.some((tab) => tab.id === requested && !tab.disabled) ? requested : firstEnabled;
    const select = (id) => {
        if (activeTab === undefined)
            dispatch(tabSelected({ group, tab: id }));
        onTabChange?.(id);
    };
    const onKeyDown = (event) => {
        const buttons = Array.from(event.currentTarget.parentElement.querySelectorAll('button[role="tab"]:not([aria-disabled="true"])'));
        const index = buttons.indexOf(event.currentTarget);
        if (index === -1)
            return;
        const target = targetIndex(event.key, index, buttons.length, orientation === "vertical");
        if (target === undefined)
            return;
        event.preventDefault();
        const button = buttons[target];
        select(button.dataset.tab);
        button.focus();
    };
    return (_jsx("div", { role: "tablist", "aria-label": label, "aria-orientation": orientation, className: className ? `tabs ${className}` : "tabs", children: tabs.map((tab) => {
            const selected = tab.id === active;
            return (_jsxs("button", { type: "button", role: "tab", id: `tab-${group}-${tab.id}`, "data-tab": tab.id, "aria-selected": selected, "aria-disabled": tab.disabled || undefined, tabIndex: selected ? 0 : -1, className: "tab", title: tab.title, onClick: () => { if (!tab.disabled)
                    select(tab.id); }, onKeyDown: onKeyDown, children: [tab.icon, _jsx("span", { children: tab.label }), tab.badge === undefined ? null : _jsx("span", { className: "tab-badge", children: tab.badge })] }, tab.id));
        }) }));
}
