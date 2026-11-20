import { JobProgress } from "./JobProgress.js";
import { JobSteps } from "./JobSteps.js";
/** Module form: `reducerKey` + `reducer` for `createReactLibReducers`, `components` for the UI. */
export declare const jobsModule: {
    readonly reducerKey: "jobs";
    readonly reducer: import("@reduxjs/toolkit").Reducer<import("./slice.js").JobsState>;
    readonly components: {
        readonly JobProgress: typeof JobProgress;
        readonly JobSteps: typeof JobSteps;
    };
};
export { JobProgress, JobSteps };
export { jobAutoCloseSet, jobViewCleared, jobViewSet, type JobsState } from "./slice.js";
export type { JobEvent, JobSnapshot, JobStep, JobView } from "./types.js";
