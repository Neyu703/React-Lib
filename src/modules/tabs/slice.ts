import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface TabsState {
  /** Active tab id per tab group. */
  active: Record<string, string>;
}

const initialState: TabsState = { active: {} };

const tabsSlice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    tabSelected: (state, { payload }: PayloadAction<{ group: string; tab: string }>) => {
      state.active[payload.group] = payload.tab;
    },
  },
});

export const { tabSelected } = tabsSlice.actions;
export const tabsReducer = tabsSlice.reducer;
