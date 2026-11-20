import type { AuthApi, AuthApiOptions } from "./types.js";
/** The REST client of `entra_auth.install_auth`; hand it to the lib with `configureReactLib({ authApi })`. */
export declare function createAuthApi(options?: AuthApiOptions): AuthApi;
