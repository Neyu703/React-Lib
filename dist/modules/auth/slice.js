import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reactLibHandlers } from "../../core/host.js";
import { createAuthApi } from "./authApi.js";
const initialState = { phase: "loading", user: null, message: null, signingIn: false };
let defaultApi;
/** The configured client, else one for `/api/auth` that is created on first use. */
const authApi = () => reactLibHandlers().authApi ?? (defaultApi ??= createAuthApi());
const reasonText = (reason, fallback) => reason instanceof Error ? reason.message : fallback;
/** Loads the sign-in state; aborting the request (the gate unmounts) changes nothing. */
export const loadAuthSession = createAsyncThunk("auth/load", async (_argument, { signal, rejectWithValue }) => {
    try {
        return await authApi().loadSession(signal);
    }
    catch (reason) {
        if (reason instanceof DOMException && reason.name === "AbortError")
            return rejectWithValue(null);
        return rejectWithValue(reasonText(reason, "Unbekannter Startfehler"));
    }
});
export const signInAuth = createAsyncThunk("auth/signIn", async (_argument, { dispatch, rejectWithValue }) => {
    try {
        await authApi().signIn();
    }
    catch (reason) {
        return rejectWithValue(reasonText(reason, "Anmeldung fehlgeschlagen"));
    }
    await dispatch(loadAuthSession());
});
export const signOutAuth = createAsyncThunk("auth/signOut", async (_argument, { dispatch }) => {
    await authApi().signOut();
    await dispatch(loadAuthSession());
});
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loadAuthSession.fulfilled, (state, { payload }) => {
            state.user = payload.user;
            state.phase = payload.authRequired && payload.user === null ? "login" : "ready";
        })
            .addCase(loadAuthSession.rejected, (state, { payload }) => {
            if (payload === null || payload === undefined)
                return;
            state.message = payload;
            state.phase = "failed";
        })
            .addCase(signInAuth.pending, (state) => {
            state.signingIn = true;
            state.message = null;
        })
            .addCase(signInAuth.fulfilled, (state) => {
            state.signingIn = false;
        })
            .addCase(signInAuth.rejected, (state, { payload }) => {
            state.signingIn = false;
            // the thunk only fails through `rejectWithValue`, so the text is always there
            state.message = payload;
        })
            .addCase(signOutAuth.pending, (state) => {
            state.phase = "loading";
        });
    },
});
export const authReducer = authSlice.reducer;
