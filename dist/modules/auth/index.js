import { LoginGate } from "./LoginGate.js";
import { authReducer } from "./slice.js";
/** Module form: `reducerKey` + `reducer` for `createReactLibReducers`, `components` for the UI. */
export const authModule = {
    reducerKey: "auth",
    reducer: authReducer,
    components: { LoginGate },
};
export { createAuthApi } from "./authApi.js";
export { LoginGate, useAuth } from "./LoginGate.js";
