import { createSlice } from "@reduxjs/toolkit";
const initialState = { view: null, autoClose: false };
const jobsSlice = createSlice({
    name: "jobs",
    initialState,
    reducers: {
        jobViewSet: (state, { payload }) => {
            state.view = payload;
        },
        jobViewCleared: (state) => {
            state.view = null;
        },
        jobAutoCloseSet: (state, { payload }) => {
            state.autoClose = payload;
        },
    },
});
export const { jobViewSet, jobViewCleared, jobAutoCloseSet } = jobsSlice.actions;
export const jobsReducer = jobsSlice.reducer;
