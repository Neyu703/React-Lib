import { LoginGate } from "./LoginGate.js";
import { authReducer } from "./slice.js";

/** Module form: `reducerKey` + `reducer` for `createReactLibReducers`, `components` for the UI. */
export const authModule = {
  reducerKey: "auth",
  reducer: authReducer,
  components: { LoginGate },
} as const;

export { createAuthApi } from "./authApi.js";
export { LoginGate, useAuth, type LoginGateProps } from "./LoginGate.js";
export type { AuthState, AuthPhase } from "./slice.js";
export type { AuthApi, AuthApiOptions, AuthSession, AuthUser } from "./types.js";
