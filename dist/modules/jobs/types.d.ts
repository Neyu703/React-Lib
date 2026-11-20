export interface JobStep {
    label: string;
    status: "pending" | "running" | "done" | "failed" | "skipped";
    current: number | null;
    total: number | null;
    detail: string;
    duration_ms: number | null;
}
export interface JobEvent {
    level: string;
    ms: number;
    text: string;
}
/** One job-status response of the backend (e.g. a "job status" endpoint). */
export interface JobSnapshot {
    job: number;
    next: number;
    title: string;
    running: boolean;
    ok: boolean | null;
    steps: JobStep[];
    events: JobEvent[];
}
/** What the progress dialog shows; built by the app from `JobSnapshot`s plus its own clock. */
export interface JobView {
    snapshot: JobSnapshot | null;
    events: JobEvent[];
    running: boolean;
    elapsed: number;
}
