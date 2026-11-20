import { LoginGate } from "./LoginGate.js";
/** Module form: `reducerKey` + `reducer` for `createReactLibReducers`, `components` for the UI. */
export declare const authModule: {
    readonly reducerKey: "auth";
    readonly reducer: import("@reduxjs/toolkit").Reducer<import("./slice.js").AuthState>;
    readonly components: {
        readonly LoginGate: typeof LoginGate;
    };
};
export { createAuthApi } from "./authApi.js";
export { LoginGate, useAuth, type LoginGateProps } from "./LoginGate.js";
export type { AuthState, AuthPhase } from "./slice.js";
export type { AuthApi, AuthApiOptions, AuthSession, AuthUser } from "./types.js";
