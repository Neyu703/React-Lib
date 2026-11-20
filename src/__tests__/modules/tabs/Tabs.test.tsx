import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
