import { createSlice } from "@reduxjs/toolkit";
const initialState = { dialogMode: "fixed", attributes: {}, cssVariables: {} };
const portalThemeSlice = createSlice({
    name: "portalTheme",
    initialState,
    reducers: {
        portalThemeSet: (_state, { payload }) => payload,
    },
});
export const { portalThemeSet } = portalThemeSlice.actions;
export const portalThemeReducer = portalThemeSlice.reducer;
