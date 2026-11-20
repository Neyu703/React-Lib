import { JobProgress } from "./JobProgress.js";
import { jobsReducer } from "./slice.js";

/** Module form: `reducerKey` + `reducer` for `createReactLibReducers`, `components` for the UI. */
export const jobsModule = {
  reducerKey: "jobs",
  reducer: jobsReducer,
  components: { JobProgress },
} as const;

export { JobProgress };
export { jobAutoCloseSet, jobViewCleared, jobViewSet, type JobsState } from "./slice.js";
export type { JobEvent, JobSnapshot, JobStep, JobView } from "./types.js";
