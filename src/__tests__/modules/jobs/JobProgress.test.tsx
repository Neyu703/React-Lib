import { act, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JobProgress } from "../../../modules/jobs/JobProgress.js";
import { configureReactLib } from "../../../core/index.js";
import { jobViewSet, type JobStep, type JobView } from "../../../modules/jobs/index.js";
import { libState, createTestStore, renderWithLibStore, type TestStore } from "../../../testing/index.js";

const step = (overrides: Partial<JobStep> = {}): JobStep => ({
  label: "Schritt",
  status: "pending",
  current: null,
  total: null,
  detail: "",
  duration_ms: null,
  ...overrides,
});

const view = (overrides: Partial<JobView> = {}, steps: JobStep[] = []): JobView => ({
  snapshot: { job: 1, next: 0, title: "Berechnung", running: true, ok: null, steps, events: [] },
  events: [],
  running: true,
  elapsed: 0,
  ...overrides,
});

const show = (store: TestStore, next: JobView) =>
  act(() => {
    store.dispatch(jobViewSet(next));
  });

const bar = () => document.getElementById("job-bar") as HTMLProgressElement;

describe("JobProgress", () => {
  it("renders nothing without a job view", () => {
    renderWithLibStore(<JobProgress />);
    expect(document.querySelector("dialog")).toBeNull();
  });

  it("shows the title, a fixed modal and an indeterminate bar while running without counts", () => {
    const store = createTestStore();
    show(store, view());
    renderWithLibStore(<JobProgress />, store);
    expect(screen.getByRole("heading", { name: "Berechnung" })).toBeInTheDocument();
    expect(document.getElementById("job-dialog")?.dataset.modal).toBe("true");
    expect(bar()).not.toHaveAttribute("value");
    expect(screen.getByText("Läuft …")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Schließen" })).toBeDisabled();
    expect(document.querySelector(".dialog-close")).toBeNull();
  });

  it("falls back to a generic title and no steps without a snapshot", () => {
    const store = createTestStore();
    show(store, view({ snapshot: null }));
    renderWithLibStore(<JobProgress />, store);
    expect(screen.getByRole("heading", { name: "Fortschritt" })).toBeInTheDocument();
    expect(document.querySelectorAll(".job-step")).toHaveLength(0);
  });

  it("computes the progress from the first counted step", () => {
    const store = createTestStore();
    show(store, view({}, [step({ total: 0 }), step({ total: 8, current: 2 })]));
    renderWithLibStore(<JobProgress />, store);
    expect(bar()).toHaveAttribute("value", "25");
  });

  it("counts a step without current as 0", () => {
    const store = createTestStore();
    show(store, view({}, [step({ total: 4 })]));
    renderWithLibStore(<JobProgress />, store);
    expect(bar()).toHaveAttribute("value", "0");
    expect(screen.getByText(/Schritt \(0 von 4\)/)).toBeInTheDocument();
  });

  it("shows icons, counts (capped at the total), details and durations per step", () => {
    const store = createTestStore();
    show(
      store,
      view({}, [
        step({ label: "A", status: "done", total: 3, current: 5, duration_ms: 450 }),
        step({ label: "B", status: "running", detail: "halb", duration_ms: 2500 }),
        step({ label: "C", status: "failed" }),
        step({ label: "D", status: "skipped" }),
        step({ label: "E", status: "pending" }),
      ]),
    );
    renderWithLibStore(<JobProgress />, store);
    const rows = [...document.querySelectorAll(".job-step")];
    expect(rows.map((row) => row.querySelector(".job-icon")?.textContent)).toEqual([
      "✓",
      "◔",
      "✕",
      "–",
      "○",
    ]);
    expect(rows[0]).toHaveClass("done");
    expect(rows[0]?.querySelector(".job-label")?.textContent).toBe("A (3 von 3)");
    expect(rows[0]?.querySelector(".job-duration")?.textContent).toBe("450 ms");
    expect(rows[1]?.querySelector(".job-detail")?.textContent).toBe("halb");
    expect(rows[1]?.querySelector(".job-duration")?.textContent).toBe("2.5 s");
    expect(rows[2]?.querySelector(".job-detail")).toBeNull();
    expect(rows[2]?.querySelector(".job-duration")?.textContent).toBe("");
  });

  it("shows the finished state with a full bar and an enabled close button", () => {
    const store = createTestStore();
    show(
      store,
      view({ running: false, elapsed: 12_400 }, []),
    );
    renderWithLibStore(<JobProgress />, store);
    expect(bar()).toHaveAttribute("value", "100");
    expect(screen.getByText("Fertig in 12.4 s.")).toBeInTheDocument();
    expect(document.getElementById("job-close")).toBeEnabled();
  });

  it("reports a failed run", () => {
    const store = createTestStore();
    const failed = view({ running: false, elapsed: 300 });
    if (failed.snapshot) failed.snapshot.ok = false;
    show(store, failed);
    renderWithLibStore(<JobProgress />, store);
    expect(
      screen.getByText("Fehlgeschlagen nach 300 ms. Einzelheiten stehen im Protokoll."),
    ).toBeInTheDocument();
  });

  it("reports a finished run without a snapshot as done", () => {
    const store = createTestStore();
    show(store, view({ running: false, snapshot: null }));
    renderWithLibStore(<JobProgress />, store);
    expect(screen.getByText("Fertig in 0 ms.")).toBeInTheDocument();
  });

  it("clears the view on the close button once the job is done", () => {
    const store = createTestStore();
    show(store, view({ running: false }));
    renderWithLibStore(<JobProgress />, store);
    fireEvent.click(document.getElementById("job-close") as HTMLElement);
    expect(libState(store).jobs.view).toBeNull();
  });

  it("clears the view on Escape once the job is done", () => {
    const store = createTestStore();
    show(store, view({ running: false }));
    renderWithLibStore(<JobProgress />, store);
    fireEvent(document.getElementById("job-dialog") as HTMLElement, new Event("cancel"));
    expect(libState(store).jobs.view).toBeNull();
  });

  it("keeps the view on Escape while the job runs", () => {
    const store = createTestStore();
    show(store, view());
    renderWithLibStore(<JobProgress />, store);
    fireEvent(document.getElementById("job-dialog") as HTMLElement, new Event("cancel"));
    expect(libState(store).jobs.view).not.toBeNull();
  });

  it("stores the auto-close choice and tells the host", () => {
    const autoCloseChanged = vi.fn();
    configureReactLib({ autoCloseChanged });
    const store = createTestStore();
    show(store, view());
    renderWithLibStore(<JobProgress />, store);
    const box = screen.getByLabelText("Nach Erfolg automatisch schließen");
    expect(box).not.toBeChecked();
    fireEvent.click(box);
    expect(libState(store).jobs.autoClose).toBe(true);
    expect(box).toBeChecked();
    expect(autoCloseChanged).toHaveBeenCalledWith(true);
  });

  it("lists the log with its levels and relative times", () => {
    const store = createTestStore();
    show(
      store,
      view({
        events: [
          { level: "info", ms: 20, text: "Start" },
          { level: "warn", ms: 1500, text: "Langsam" },
        ],
      }),
    );
    renderWithLibStore(<JobProgress />, store);
    const rows = [...document.querySelectorAll("#job-log li")];
    expect(rows.map((row) => row.className)).toEqual(["info", "warn"]);
    expect(rows[0]?.textContent).toBe("+20 ms Start");
    expect(rows[1]?.textContent).toBe("+1.5 s Langsam");
  });

  it("follows new log lines only while the reader sits at the bottom", () => {
    const store = createTestStore();
    show(store, view());
    renderWithLibStore(<JobProgress />, store);
    const log = document.getElementById("job-log") as HTMLElement;
    Object.defineProperty(log, "scrollHeight", { value: 1000, configurable: true });
    Object.defineProperty(log, "clientHeight", { value: 100, configurable: true });

    log.scrollTop = 900;
    show(store, view({ events: [{ level: "info", ms: 1, text: "a" }] }));
    expect(log.scrollTop).toBe(1000);

    log.scrollTop = 0;
    show(
      store,
      view({
        events: [
          { level: "info", ms: 1, text: "a" },
          { level: "info", ms: 2, text: "b" },
        ],
      }),
    );
    expect(log.scrollTop).toBe(0);
  });
});
