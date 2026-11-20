/** The signed-in person as the server of `entra_auth` reports it. */
export interface AuthUser {
  readonly id: string;
  readonly name: string;
  readonly username: string;
}

/** Answer of `GET /api/auth/session` and `POST /api/auth/login`. */
export interface AuthSession {
  readonly authRequired: boolean;
  readonly user: AuthUser | null;
}

export interface AuthApi {
  loadSession(signal?: AbortSignal): Promise<AuthSession>;
  signIn(): Promise<AuthSession>;
  signOut(): Promise<void>;
}

export interface AuthApiOptions {
  /** Extra headers for sign-in and sign-out (e.g. the token of the program); evaluated per call. */
  readonly headers?: () => Record<string, string>;
  /** Path of the endpoints of `entra_auth.install_auth`. */
  readonly basePath?: string;
}
