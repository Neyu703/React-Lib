import { fireEvent, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

// The real Modal never reports a close while a job runs (no Escape, no close button); a popup window's pagehide could, so the guard in JobProgress is checked with a stand-in.
vi.mock("../../../modules/dialogs/Modal.js", () => ({
  Modal: ({ children, onClose }: { children: ReactNode; onClose: () => void }) => (
    <div>
      <button
        type="button"
        onClick={onClose}
      >
        modal-onclose
      </button>
      {children}
    </div>
  ),
}));

import { act } from "@testing-library/react";
import { JobProgress } from "../../../modules/jobs/JobProgress.js";
import { jobViewSet } from "../../../modules/jobs/index.js";
import { libState, createTestStore, renderWithLibStore } from "../../../testing/index.js";

const show = (running: boolean) => {
  const store = createTestStore();
  act(() => {
    store.dispatch(
      jobViewSet({ snapshot: null, events: [], running, elapsed: 0 }),
    );
  });
  renderWithLibStore(<JobProgress />, store);
  fireEvent.click(screen.getByRole("button", { name: "modal-onclose" }));
  return store;
};

describe("JobProgress onClose", () => {
  it("keeps the view while the job runs", () => {
    expect(libState(show(true)).jobs.view).not.toBeNull();
  });

  it("clears the view once the job is done", () => {
    expect(libState(show(false)).jobs.view).toBeNull();
  });
});
