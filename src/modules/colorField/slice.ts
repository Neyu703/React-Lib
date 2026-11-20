import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ColorFieldState {
  /** The user's own colours, shown in every colour field's palette. */
  customColors: string[];
}

const initialState: ColorFieldState = { customColors: [] };

const colorFieldSlice = createSlice({
  name: "colorField",
  initialState,
  reducers: {
    customColorsSet: (state, { payload }: PayloadAction<string[]>) => {
      state.customColors = payload;
    },
  },
});

export const { customColorsSet } = colorFieldSlice.actions;
export const colorFieldReducer = colorFieldSlice.reducer;
