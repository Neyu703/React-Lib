import { createSlice } from "@reduxjs/toolkit";
const initialState = { customColors: [] };
const colorFieldSlice = createSlice({
    name: "colorField",
    initialState,
    reducers: {
        customColorsSet: (state, { payload }) => {
            state.customColors = payload;
        },
    },
});
export const { customColorsSet } = colorFieldSlice.actions;
export const colorFieldReducer = colorFieldSlice.reducer;
