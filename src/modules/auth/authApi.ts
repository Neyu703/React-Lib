import type { AuthApi, AuthApiOptions, AuthSession } from "./types.js";

async function errorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: unknown; error?: unknown };
    if (typeof body.detail === "string") return body.detail;
    if (typeof body.error === "string") return body.error;
  } catch {
    // No JSON answer: use the default text.
  }
  return `${fallback} (${response.status}).`;
}

/** The REST client of `entra_auth.install_auth`; hand it to the lib with `configureReactLib({ authApi })`. */
export function createAuthApi(options: AuthApiOptions = {}): AuthApi {
  const basePath = options.basePath ?? "/api/auth";
  const post = (path: string): Promise<Response> =>
    fetch(`${basePath}/${path}`, { method: "POST", headers: options.headers?.() ?? {} });

  return {
    async loadSession(signal) {
      const response = await fetch(`${basePath}/session`, signal === undefined ? {} : { signal });
      if (!response.ok) {
        throw new Error(await errorMessage(response, "Anmeldestatus konnte nicht geladen werden"));
      }
      return (await response.json()) as AuthSession;
    },
    async signIn() {
      const response = await post("login");
      if (!response.ok) throw new Error(await errorMessage(response, "Anmeldung fehlgeschlagen"));
      return (await response.json()) as AuthSession;
    },
    async signOut() {
      await post("logout");
    },
  };
}
