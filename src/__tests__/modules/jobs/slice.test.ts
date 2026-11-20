import { describe, expect, it } from "vitest";
import { createTestStore, libState } from "../../../testing/index.js";
import { jobAutoCloseSet, jobViewCleared, jobViewSet, type JobView } from "../../../modules/jobs/index.js";

describe("jobs slice", () => {
  const view: JobView = { snapshot: null, events: [], running: true, elapsed: 5 };

  it("shows and clears the progress view", () => {
    const store = createTestStore();
    expect(libState(store).jobs).toEqual({ view: null, autoClose: false });
    store.dispatch(jobViewSet(view));
    expect(libState(store).jobs.view).toEqual(view);
    store.dispatch(jobViewCleared());
    expect(libState(store).jobs.view).toBeNull();
  });

  it("remembers the auto-close choice", () => {
    const store = createTestStore();
    store.dispatch(jobAutoCloseSet(true));
    expect(libState(store).jobs.autoClose).toBe(true);
  });
});
