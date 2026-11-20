import type { AuthApi } from "../modules/auth/index.js";
/** An auth client that needs no server: sign-in switched off, every call succeeds; override what a test needs. */
export declare function fakeAuthApi(overrides?: Partial<AuthApi>): AuthApi;
