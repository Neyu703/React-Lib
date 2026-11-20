import { useEffect } from "react";
import type { ReactNode } from "react";
import { useReactLibSelector, useReactLibThunk } from "../../core/hooks.js";
import { loadAuthSession, signInAuth, signOutAuth } from "./slice.js";
import type { AuthUser } from "./types.js";

export interface LoginGateProps {
  readonly children: ReactNode;
  /** Program name above the sign-in button. */
  readonly title?: string;
  /** Shown while the sign-in state loads. */
  readonly loading?: ReactNode;
}

/** The person and the sign-out for components below `LoginGate`; reads the store, needs no provider. */
export function useAuth(): { readonly user: AuthUser | null; readonly signOut: () => Promise<void> } {
  const dispatch = useReactLibThunk();
  const user = useReactLibSelector((state) => state.auth.user);
  return { user, signOut: async () => void (await dispatch(signOutAuth())) };
}

/** Shows the children only when no sign-in is needed or a person is signed in. */
export function LoginGate({ children, title, loading = null }: LoginGateProps) {
  const dispatch = useReactLibThunk();
  const phase = useReactLibSelector((state) => state.auth.phase);
  const message = useReactLibSelector((state) => state.auth.message);
  const signingIn = useReactLibSelector((state) => state.auth.signingIn);

  useEffect(() => {
    const request = dispatch(loadAuthSession());
    return () => request.abort();
  }, [dispatch]);

  if (phase === "loading") return <>{loading}</>;
  if (phase === "failed") {
    return (
      <main className="auth-gate">
        <p className="auth-gate-error" role="alert">
          {message}
        </p>
      </main>
    );
  }
  if (phase === "login") {
    return (
      <main className="auth-gate">
        <section className="auth-gate-card">
          {title !== undefined && <h1>{title}</h1>}
          <p>Anmeldung erforderlich</p>
          <button
            type="button"
            className="auth-gate-button"
            disabled={signingIn}
            onClick={() => void dispatch(signInAuth())}
          >
            {signingIn ? "Anmeldung läuft …" : "Mit Microsoft anmelden"}
          </button>
          {message !== null && (
            <p className="auth-gate-error" role="alert">
              {message}
            </p>
          )}
        </section>
      </main>
    );
  }
  return <>{children}</>;
}
