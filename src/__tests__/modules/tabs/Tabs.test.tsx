import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tabs, tabSelected, useActiveTab } from "../../../modules/tabs/index.js";
import { createTestStore, libState, renderWithLibStore } from "../../../testing/index.js";

const TABS = [
  { id: "one", label: "Eins", badge: 3 },
  { id: "two", label: "Zwei" },
  { id: "three", label: "Drei" },
];

const renderTabs = (props: { defaultTab?: string } = {}) =>
  renderWithLibStore(
    <Tabs
      group="main"
      tabs={TABS}
      label="Bereiche"
      defaultTab={props.defaultTab}
    />,
  );

const tab = (name: string) => screen.getByRole("tab", { name: new RegExp(name) });

describe("Tabs", () => {
  it("renders a labelled tablist with the first tab selected and a badge", () => {
    renderTabs();
    expect(screen.getByRole("tablist", { name: "Bereiche" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(tab("Eins")).toHaveAttribute("aria-selected", "true");
    expect(tab("Eins")).toHaveAttribute("tabindex", "0");
    expect(tab("Zwei")).toHaveAttribute("aria-selected", "false");
    expect(tab("Zwei")).toHaveAttribute("tabindex", "-1");
    expect(tab("Eins")).toHaveTextContent("Eins3");
  });

  it("honours defaultTab until a tab is picked, then stores the pick", () => {
    const { store } = renderTabs({ defaultTab: "two" });
    expect(tab("Zwei")).toHaveAttribute("aria-selected", "true");
    fireEvent.click(tab("Drei"));
    expect(libState(store).tabs.active).toEqual({ main: "three" });
    expect(tab("Drei")).toHaveAttribute("aria-selected", "true");
  });

  it("shows a selection that is already in the store", () => {
    const store = createTestStore();
    store.dispatch(tabSelected({ group: "main", tab: "two" }));
    renderWithLibStore(
      <Tabs
        group="main"
        tabs={TABS}
        label="A"
      />,
      store,
    );
    expect(tab("Zwei")).toHaveAttribute("aria-selected", "true");
  });

  it("moves with arrow keys (wrapping), Home and End and focuses the target", () => {
    renderTabs();
    fireEvent.keyDown(tab("Eins"), { key: "ArrowRight" });
    expect(tab("Zwei")).toHaveAttribute("aria-selected", "true");
    expect(tab("Zwei")).toHaveFocus();
    fireEvent.keyDown(tab("Zwei"), { key: "ArrowLeft" });
    fireEvent.keyDown(tab("Eins"), { key: "ArrowLeft" });
    expect(tab("Drei")).toHaveAttribute("aria-selected", "true");
    expect(tab("Drei")).toHaveFocus();
    fireEvent.keyDown(tab("Drei"), { key: "ArrowRight" });
    expect(tab("Eins")).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(tab("Eins"), { key: "End" });
    expect(tab("Drei")).toHaveFocus();
    fireEvent.keyDown(tab("Drei"), { key: "Home" });
    expect(tab("Eins")).toHaveFocus();
  });

  it("ignores other keys", () => {
    const { store } = renderTabs();
    fireEvent.keyDown(tab("Eins"), { key: "a" });
    expect(libState(store).tabs.active).toEqual({});
  });

  it("renders an empty bar without tabs", () => {
    renderWithLibStore(
      <Tabs
        group="none"
        tabs={[]}
        label="Leer"
      />,
    );
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
  });

  it("lets the app control vertical tabs and skips disabled tabs with keyboard and mouse", () => {
    const onTabChange = vi.fn();
    const tabs = [TABS[0]!, { ...TABS[1]!, disabled: true, title: "In der Konfiguration ausgeschaltet" },
      { ...TABS[2]!, icon: <svg aria-hidden="true" /> }];
    const { store } = renderWithLibStore(
      <Tabs group="main" tabs={tabs} label="Seitenleiste" orientation="vertical" className="sidebar"
        activeTab="one" onTabChange={onTabChange} />,
    );
    const list = screen.getByRole("tablist");
    expect(list).toHaveClass("tabs", "sidebar");
    expect(list).toHaveAttribute("aria-orientation", "vertical");
    expect(tab("Drei").querySelector("svg")).not.toBeNull();
    expect(tab("Zwei")).toHaveAttribute("title", "In der Konfiguration ausgeschaltet");
    expect(tab("Zwei")).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(tab("Zwei"));
    fireEvent.keyDown(tab("Zwei"), { key: "ArrowDown" });
    fireEvent.keyDown(tab("Eins"), { key: "ArrowRight" });
    expect(onTabChange).not.toHaveBeenCalled();
    fireEvent.keyDown(tab("Eins"), { key: "ArrowDown" });
    expect(tab("Drei")).toHaveFocus();
    expect(onTabChange).toHaveBeenCalledWith("three");
    fireEvent.keyDown(tab("Drei"), { key: "ArrowUp" });
    expect(tab("Eins")).toHaveFocus();
    expect(onTabChange).toHaveBeenLastCalledWith("one");
    expect(tab("Eins")).toHaveAttribute("aria-selected", "true");
    expect(libState(store).tabs.active).toEqual({});
  });

  it("keeps a valid focus target when the selected tab is removed or disabled", () => {
    const tabs = [{ ...TABS[0]!, disabled: true }, ...TABS.slice(1)];
    const view = renderWithLibStore(<Tabs group="main" tabs={tabs} label="Bereiche" defaultTab="one" />);
    expect(tab("Zwei")).toHaveAttribute("tabindex", "0");
    fireEvent.click(tab("Drei"));
    view.rerender(<Tabs group="main" tabs={tabs.slice(0, 2)} label="Bereiche" defaultTab="one" />);
    expect(tab("Zwei")).toHaveAttribute("aria-selected", "true");
  });

  it("useActiveTab reads the selection or the fallback", () => {
    const Probe = () => <p>{useActiveTab("g", "fb")}</p>;
    const store = createTestStore();
    const view = renderWithLibStore(<Probe />, store);
    expect(screen.getByText("fb")).toBeInTheDocument();
    view.unmount();
    store.dispatch(tabSelected({ group: "g", tab: "picked" }));
    renderWithLibStore(<Probe />, store);
    expect(screen.getByText("picked")).toBeInTheDocument();
  });
});
