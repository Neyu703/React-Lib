import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  configureReactLib,
  LoginGate,
  useAuth,
  type AuthApi,
  type AuthSession,
} from "../../../index.js";
import { createTestStore, libState, renderWithLibStore, resetReactLib } from "../../../testing/index.js";

const USER = { id: "1", name: "Erika Muster", username: "erika@kte.example" };

function fakeApi(overrides: Partial<AuthApi> = {}): AuthApi {
  return {
    loadSession: vi.fn(() => Promise.resolve({ authRequired: false, user: null })),
    signIn: vi.fn(() => Promise.resolve({ authRequired: true, user: USER })),
    signOut: vi.fn(() => Promise.resolve()),
    ...overrides,
  };
}

function Who() {
  const { user, signOut } = useAuth();
  return (
    <button type="button" onClick={() => void signOut()}>
      {user?.name ?? "ohne Anmeldung"}
    </button>
  );
}

const gate = (api: AuthApi, props: { title?: string; loading?: React.ReactNode } = {}) => {
  configureReactLib({ authApi: api });
  return renderWithLibStore(
    <LoginGate {...props}>
      <Who />
    </LoginGate>,
    createTestStore(),
  );
};

afterEach(() => {
  cleanup();
  resetReactLib();
});

describe("LoginGate", () => {
  it("shows the children at once when no sign-in is needed", async () => {
    gate(fakeApi());
    expect(await screen.findByText("ohne Anmeldung")).toBeInTheDocument();
  });

  it("shows the placeholder while the state loads", async () => {
    gate(fakeApi(), { loading: <p>lädt</p> });
    expect(screen.getByText("lädt")).toBeInTheDocument();
    await screen.findByText("ohne Anmeldung");
  });

  it("asks for the sign-in with the title and shows the children afterwards", async () => {
    const sessions: AuthSession[] = [
      { authRequired: true, user: null },
      { authRequired: true, user: USER },
    ];
    const api = fakeApi({
      loadSession: vi.fn(() => Promise.resolve(sessions.shift() as AuthSession)),
    });
    gate(api, { title: "Dienstplan" });
    expect(await screen.findByRole("heading", { name: "Dienstplan" })).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: "Mit Microsoft anmelden" }));
    expect(await screen.findByText("Erika Muster")).toBeInTheDocument();
    expect(api.signIn).toHaveBeenCalledTimes(1);
  });

  it("shows the error of a failed sign-in and lets the person retry", async () => {
    const api = fakeApi({
      loadSession: vi.fn(() => Promise.resolve({ authRequired: true, user: null })),
      signIn: vi.fn(() => Promise.reject(new Error("abgebrochen"))),
    });
    const { store } = gate(api);
    fireEvent.click(await screen.findByRole("button", { name: "Mit Microsoft anmelden" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("abgebrochen");
    expect(screen.getByRole("button", { name: "Mit Microsoft anmelden" })).toBeEnabled();
    expect(libState(store).auth.signingIn).toBe(false);
  });

  it("uses the default text when the sign-in fails without a message", async () => {
    const api = fakeApi({
      loadSession: vi.fn(() => Promise.resolve({ authRequired: true, user: null })),
      signIn: vi.fn(() => Promise.reject("x")),
    });
    gate(api);
    fireEvent.click(await screen.findByRole("button", { name: "Mit Microsoft anmelden" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Anmeldung fehlgeschlagen");
  });

  it("disables the button while the sign-in runs", async () => {
    let finish: (session: AuthSession) => void = () => undefined;
    const api = fakeApi({
      loadSession: vi.fn(() => Promise.resolve({ authRequired: true, user: null })),
      signIn: vi.fn(() => new Promise<AuthSession>((resolve) => (finish = resolve))),
    });
    gate(api);
    fireEvent.click(await screen.findByRole("button", { name: "Mit Microsoft anmelden" }));
    expect(await screen.findByRole("button", { name: "Anmeldung läuft …" })).toBeDisabled();
    finish({ authRequired: true, user: null });
    await screen.findByRole("button", { name: "Mit Microsoft anmelden" });
  });

  it("signs out and asks for the sign-in again", async () => {
    let signedIn = true;
    const api = fakeApi({
      loadSession: vi.fn(() => Promise.resolve({ authRequired: true, user: signedIn ? USER : null })),
      signOut: vi.fn(() => {
        signedIn = false;
        return Promise.resolve();
      }),
    });
    gate(api);
    fireEvent.click(await screen.findByText("Erika Muster"));
    expect(await screen.findByRole("button", { name: "Mit Microsoft anmelden" })).toBeInTheDocument();
  });

  it.each([
    [new Error("kaputt"), "kaputt"],
    ["x", "Unbekannter Startfehler"],
  ])("shows a load error (%s)", async (reason, text) => {
    gate(fakeApi({ loadSession: vi.fn(() => Promise.reject(reason)) }));
    expect(await screen.findByRole("alert")).toHaveTextContent(text);
  });

  it("aborts the request on unmount without showing an error", async () => {
    const api = fakeApi({
      loadSession: vi.fn(
        (signal?: AbortSignal) =>
          new Promise<AuthSession>((_resolve, reject) =>
            signal?.addEventListener("abort", () =>
              reject(new DOMException("abort", "AbortError")),
            ),
          ),
      ),
    });
    const { unmount, store } = gate(api);
    unmount();
    await waitFor(() => expect(api.loadSession).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve));
    expect(libState(store).auth.phase).toBe("loading");
    expect(libState(store).auth.message).toBeNull();
  });
});
