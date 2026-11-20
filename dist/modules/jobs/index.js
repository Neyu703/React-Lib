import { JobProgress } from "./JobProgress.js";
import { JobSteps } from "./JobSteps.js";
import { jobsReducer } from "./slice.js";
/** Module form: `reducerKey` + `reducer` for `createReactLibReducers`, `components` for the UI. */
export const jobsModule = {
    reducerKey: "jobs",
    reducer: jobsReducer,
    components: { JobProgress, JobSteps },
};
export { JobProgress, JobSteps };
export { jobAutoCloseSet, jobViewCleared, jobViewSet } from "./slice.js";
