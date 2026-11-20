import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReactLibDispatch, useReactLibSelector } from "../../core/hooks.js";
import { tabSelected } from "./slice.js";
/** The active tab id of `group`, or `fallback` until a tab was picked. */
export const useActiveTab = (group, fallback) => useReactLibSelector((state) => state.tabs.active[group] ?? fallback);
/** Index of the tab a navigation key moves to; undefined for any other key. */
function targetIndex(key, index, count) {
    if (key === "ArrowRight")
        return (index + 1) % count;
    if (key === "ArrowLeft")
        return (index - 1 + count) % count;
    if (key === "Home")
        return 0;
    if (key === "End")
        return count - 1;
    return undefined;
}
/** A tab bar that keeps its selection in the store (`tabs` slice); read it elsewhere with `useActiveTab`. */
export function Tabs({ group, tabs, defaultTab, label }) {
    const dispatch = useReactLibDispatch();
    const active = useActiveTab(group, defaultTab ?? tabs[0]?.id ?? "");
    const select = (tab) => {
        dispatch(tabSelected({ group, tab }));
    };
    const onKeyDown = (event, index) => {
        const target = targetIndex(event.key, index, tabs.length);
        if (target === undefined)
            return;
        event.preventDefault();
        select(tabs[target].id);
        (event.currentTarget.parentElement?.children[target]).focus();
    };
    return (_jsx("div", { role: "tablist", "aria-label": label, className: "tabs", children: tabs.map((tab, index) => {
            const selected = tab.id === active;
            return (_jsxs("button", { type: "button", role: "tab", id: `tab-${group}-${tab.id}`, "aria-selected": selected, tabIndex: selected ? 0 : -1, className: "tab", onClick: () => select(tab.id), onKeyDown: (event) => onKeyDown(event, index), children: [tab.label, tab.badge === undefined ? null : _jsx("span", { className: "tab-badge", children: tab.badge })] }, tab.id));
        }) }));
}
