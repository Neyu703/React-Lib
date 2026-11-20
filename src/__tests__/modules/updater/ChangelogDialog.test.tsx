import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChangelogDialog, type ChangelogData } from "../../../modules/updater/ChangelogDialog.js";
import { configureReactLib } from "../../../core/index.js";
import { renderWithLibStore } from "../../../testing/index.js";

const data: ChangelogData = {
  hidden: false,
  entries: [
    { group: "Version 2", date: "2026-02-01", title: "", text: "Nur Text ohne Link." },
    {
      group: "Version 1",
      date: "2026-01-01",
      title: "Planung",
      text: "Siehe {plan|Dienstplan} und {team|Team}!",
    },
    { group: "Version 1", date: "2026-01-02", title: "", text: "Mehr im {plan|Plan}." },
    { group: "Version 0", date: "2025-12-01", title: "", text: "Erster" },
    { group: "Version 0", date: "2025-12-02", title: "", text: "Zweiter" },
  ],
};

const open = (changelog: ChangelogData = data) => {
  const onClose = vi.fn();
  const openTab = vi.fn();
  configureReactLib({ openTab });
  renderWithLibStore(
    <ChangelogDialog
      data={changelog}
      onClose={onClose}
    />,
  );
  return { onClose, openTab };
};

describe("ChangelogDialog", () => {
  it("groups consecutive entries and opens only the newest group", () => {
    open();
    const groups = document.querySelectorAll("details.changelog-group");
    expect([...groups].map((group) => group.querySelector("summary")?.firstChild?.textContent)).toEqual([
      "Version 2",
      "Version 1",
      "Version 0",
    ]);
    expect([...groups].map((group) => (group as HTMLDetailsElement).open)).toEqual([
      true,
      false,
      false,
    ]);
  });

  it("shows the date next to a group with one untitled entry only", () => {
    open();
    const groups = document.querySelectorAll("details.changelog-group");
    expect(groups[0]?.querySelector("summary .muted")).toHaveTextContent("2026-02-01");
    expect(groups[1]?.querySelector(":scope > summary .muted")).toBeNull();
    expect(groups[2]?.querySelector(":scope > summary .muted")).toBeNull();
  });

  it("renders titled entries as nested details with their date", () => {
    open();
    const entry = document.querySelector("details.changelog-entry") as HTMLDetailsElement;
    expect(entry.open).toBe(true);
    expect(entry.querySelector("summary")).toHaveTextContent("Planung 2026-01-01");
  });

  it("turns {tab|Label} into links that close the dialog and open the tab", () => {
    const { onClose, openTab } = open();
    const links = document.querySelectorAll("a.tab-link");
    expect([...links].map((link) => link.textContent)).toEqual(["Dienstplan", "Team", "Plan"]);
    expect((links[1] as HTMLElement).dataset.tab).toBe("team");
    fireEvent.click(links[0] as HTMLElement);
    expect(openTab).toHaveBeenLastCalledWith("plan");
    expect(onClose).toHaveBeenLastCalledWith(false);
    fireEvent.click(links[2] as HTMLElement);
    expect(openTab).toHaveBeenLastCalledWith("plan");
    expect(openTab).toHaveBeenCalledTimes(2);
  });

  it("keeps plain text without links as it is", () => {
    open();
    expect(screen.getByText("Nur Text ohne Link.")).toBeInTheDocument();
    expect(screen.getByText(/Siehe/)).toHaveTextContent("Siehe Dienstplan und Team!");
  });

  it("passes the hide choice on when submitted", () => {
    const { onClose } = open();
    fireEvent.click(screen.getByLabelText("Nicht nochmal anzeigen"));
    fireEvent.submit(document.getElementById("changelog-form") as HTMLElement);
    expect(onClose).toHaveBeenCalledWith(true);
  });

  it("starts with the stored hide choice and passes it on from links and the close button", () => {
    const { onClose, openTab } = open({ ...data, hidden: true });
    expect(screen.getByLabelText("Nicht nochmal anzeigen")).toBeChecked();
    fireEvent.click(document.querySelector("a.tab-link") as HTMLElement);
    expect(onClose).toHaveBeenLastCalledWith(true);
    expect(openTab).toHaveBeenCalledWith("plan");
    fireEvent.click(document.querySelector(".dialog-close") as HTMLElement);
    expect(onClose).toHaveBeenLastCalledWith(true);
  });

  it("copes with an empty list", () => {
    open({ hidden: false, entries: [] });
    expect(document.querySelectorAll("details")).toHaveLength(0);
    expect(document.getElementById("changelog-entries")).toBeEmptyDOMElement();
  });
});
