import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PortalThemeState } from "./types.js";

const initialState: PortalThemeState = { dialogMode: "fixed", attributes: {}, cssVariables: {} };

const portalThemeSlice = createSlice({
  name: "portalTheme",
  initialState,
  reducers: {
    portalThemeSet: (_state, { payload }: PayloadAction<PortalThemeState>) => payload,
  },
});

export const { portalThemeSet } = portalThemeSlice.actions;
export const portalThemeReducer = portalThemeSlice.reducer;
