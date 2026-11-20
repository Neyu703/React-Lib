import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { JobView } from "./types.js";

export interface JobsState {
  /** null = no progress dialog. */
  view: JobView | null;
  /** Close the dialog by itself after a successful run. */
  autoClose: boolean;
}

const initialState: JobsState = { view: null, autoClose: false };

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    jobViewSet: (state, { payload }: PayloadAction<JobView>) => {
      state.view = payload;
    },
    jobViewCleared: (state) => {
      state.view = null;
    },
    jobAutoCloseSet: (state, { payload }: PayloadAction<boolean>) => {
      state.autoClose = payload;
    },
  },
});

export const { jobViewSet, jobViewCleared, jobAutoCloseSet } = jobsSlice.actions;
export const jobsReducer = jobsSlice.reducer;
