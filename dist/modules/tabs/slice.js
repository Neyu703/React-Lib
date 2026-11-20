import { createSlice } from "@reduxjs/toolkit";
const initialState = { active: {} };
const tabsSlice = createSlice({
    name: "tabs",
    initialState,
    reducers: {
        tabSelected: (state, { payload }) => {
            state.active[payload.group] = payload.tab;
        },
    },
});
export const { tabSelected } = tabsSlice.actions;
export const tabsReducer = tabsSlice.reducer;
