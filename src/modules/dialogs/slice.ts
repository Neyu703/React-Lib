import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DialogBox } from "./types.js";

export interface DialogsState {
  /** Open non-exempt dialogs, oldest first; the "max open dialogs" limit evicts from the front. */
  openIds: string[];
  limit: number;
  /** Remembered position and size of the floating dialogs, by dialog id. */
  boxes: Record<string, DialogBox>;
  /** Counts "forget all boxes" requests, so floating dialogs can put themselves back in the middle. */
  boxesReset: number;
}

const initialState: DialogsState = { openIds: [], limit: 1, boxes: {}, boxesReset: 0 };

const dialogsSlice = createSlice({
  name: "dialogs",
  initialState,
  reducers: {
    dialogOpened: (state, { payload }: PayloadAction<{ id: string }>) => {
      const others = state.openIds.filter((id) => id !== payload.id);
      state.openIds = [...others.slice(Math.max(0, others.length - (state.limit - 1))), payload.id];
    },
    dialogClosed: (state, { payload }: PayloadAction<{ id: string }>) => {
      state.openIds = state.openIds.filter((id) => id !== payload.id);
    },
    dialogLimitSet: (state, { payload }: PayloadAction<string | number>) => {
      state.limit = Math.max(1, Number(payload) || 1);
    },
    dialogBoxesLoaded: (state, { payload }: PayloadAction<Record<string, DialogBox>>) => {
      state.boxes = payload;
    },
    dialogBoxSaved: (state, { payload }: PayloadAction<{ id: string; box: DialogBox }>) => {
      state.boxes[payload.id] = payload.box;
    },
    dialogBoxesReset: (state) => {
      state.boxes = {};
      state.boxesReset += 1;
    },
  },
});

export const {
  dialogOpened,
  dialogClosed,
  dialogLimitSet,
  dialogBoxesLoaded,
  dialogBoxSaved,
  dialogBoxesReset,
} = dialogsSlice.actions;
export const dialogsReducer = dialogsSlice.reducer;
