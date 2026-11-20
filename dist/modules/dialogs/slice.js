import { createSlice } from "@reduxjs/toolkit";
const initialState = { openIds: [], limit: 1, boxes: {}, boxesReset: 0 };
const dialogsSlice = createSlice({
    name: "dialogs",
    initialState,
    reducers: {
        dialogOpened: (state, { payload }) => {
            const others = state.openIds.filter((id) => id !== payload.id);
            state.openIds = [...others.slice(Math.max(0, others.length - (state.limit - 1))), payload.id];
        },
        dialogClosed: (state, { payload }) => {
            state.openIds = state.openIds.filter((id) => id !== payload.id);
        },
        dialogLimitSet: (state, { payload }) => {
            state.limit = Math.max(1, Number(payload) || 1);
        },
        dialogBoxesLoaded: (state, { payload }) => {
            state.boxes = payload;
        },
        dialogBoxSaved: (state, { payload }) => {
            state.boxes[payload.id] = payload.box;
        },
        dialogBoxesReset: (state) => {
            state.boxes = {};
            state.boxesReset += 1;
        },
    },
});
export const { dialogOpened, dialogClosed, dialogLimitSet, dialogBoxesLoaded, dialogBoxSaved, dialogBoxesReset, } = dialogsSlice.actions;
export const dialogsReducer = dialogsSlice.reducer;
