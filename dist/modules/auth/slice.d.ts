import type { AuthSession, AuthUser } from "./types.js";
export type AuthPhase = "loading" | "login" | "ready" | "failed";
export interface AuthState {
    phase: AuthPhase;
    /** The signed-in person; null while the sign-in is switched off or nobody is signed in. */
    user: AuthUser | null;
    message: string | null;
    signingIn: boolean;
}
/** Loads the sign-in state; aborting the request (the gate unmounts) changes nothing. */
export declare const loadAuthSession: import("@reduxjs/toolkit").AsyncThunk<AuthSession, void, {
    state?: unknown;
    dispatch?: import("@reduxjs/toolkit").ThunkDispatch<unknown, unknown, import("@reduxjs/toolkit").UnknownAction>;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
    rejectValue: string | null;
}>;
export declare const signInAuth: import("@reduxjs/toolkit").AsyncThunk<void, void, {
    state?: unknown;
    dispatch?: import("@reduxjs/toolkit").ThunkDispatch<unknown, unknown, import("@reduxjs/toolkit").UnknownAction>;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
    rejectValue: string;
}>;
export declare const signOutAuth: import("@reduxjs/toolkit").AsyncThunk<void, void, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const authReducer: import("@reduxjs/toolkit").Reducer<AuthState>;
