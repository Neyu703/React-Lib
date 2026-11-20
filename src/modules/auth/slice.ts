import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reactLibHandlers } from "../../core/host.js";
import { createAuthApi } from "./authApi.js";
import type { AuthApi, AuthSession, AuthUser } from "./types.js";

export type AuthPhase = "loading" | "login" | "ready" | "failed";

export interface AuthState {
  phase: AuthPhase;
  /** The signed-in person; null while the sign-in is switched off or nobody is signed in. */
  user: AuthUser | null;
  message: string | null;
  signingIn: boolean;
}

const initialState: AuthState = { phase: "loading", user: null, message: null, signingIn: false };

let defaultApi: AuthApi | undefined;
/** The configured client, else one for `/api/auth` that is created on first use. */
const authApi = (): AuthApi => reactLibHandlers().authApi ?? (defaultApi ??= createAuthApi());

const reasonText = (reason: unknown, fallback: string): string =>
  reason instanceof Error ? reason.message : fallback;

/** Loads the sign-in state; aborting the request (the gate unmounts) changes nothing. */
export const loadAuthSession = createAsyncThunk<AuthSession, void, { rejectValue: string | null }>(
  "auth/load",
  async (_argument, { signal, rejectWithValue }) => {
    try {
      return await authApi().loadSession(signal);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return rejectWithValue(null);
      return rejectWithValue(reasonText(reason, "Unbekannter Startfehler"));
    }
  },
);

export const signInAuth = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/signIn",
  async (_argument, { dispatch, rejectWithValue }) => {
    try {
      await authApi().signIn();
    } catch (reason) {
      return rejectWithValue(reasonText(reason, "Anmeldung fehlgeschlagen"));
    }
    await dispatch(loadAuthSession());
  },
);

export const signOutAuth = createAsyncThunk<void>("auth/signOut", async (_argument, { dispatch }) => {
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
        if (payload === null || payload === undefined) return;
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
        state.message = payload as string;
      })
      .addCase(signOutAuth.pending, (state) => {
        state.phase = "loading";
      });
  },
});

export const authReducer = authSlice.reducer;
