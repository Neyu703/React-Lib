import type { JobView } from "./types.js";
export interface JobsState {
    /** null = no progress dialog. */
    view: JobView | null;
    /** Close the dialog by itself after a successful run. */
    autoClose: boolean;
}
export declare const jobViewSet: import("@reduxjs/toolkit").ActionCreatorWithPayload<JobView, "jobs/jobViewSet">, jobViewCleared: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"jobs/jobViewCleared">, jobAutoCloseSet: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "jobs/jobAutoCloseSet">;
export declare const jobsReducer: import("@reduxjs/toolkit").Reducer<JobsState>;
