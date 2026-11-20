import { afterEach, describe, expect, it, vi } from "vitest";
import { createAuthApi } from "../../../index.js";

const USER = { id: "1", name: "Erika Muster", username: "erika@kte.example" };

function stub(status: number, body: unknown) {
  const fetchMock = vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createAuthApi", () => {
  it("loads the session and sends sign-in and sign-out with the extra headers", async () => {
    const fetchMock = stub(200, { authRequired: true, user: USER });
    const api = createAuthApi({ headers: () => ({ "X-Token": "t" }) });
    await expect(api.loadSession(new AbortController().signal)).resolves.toEqual({
      authRequired: true,
      user: USER,
    });
    await api.loadSession();
    await api.signIn();
    await api.signOut();
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "X-Token": "t" },
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
      headers: { "X-Token": "t" },
    });
  });

  it("uses the given path without headers and reports error texts of the answer", async () => {
    stub(401, { detail: "Anmeldung erforderlich." });
    const api = createAuthApi({ basePath: "/x" });
    await expect(api.signIn()).rejects.toThrow("Anmeldung erforderlich.");
    stub(500, { error: "kaputt" });
    await expect(api.loadSession()).rejects.toThrow("kaputt");
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("kein json", { status: 502 }))),
    );
    await expect(api.signIn()).rejects.toThrow("Anmeldung fehlgeschlagen (502).");
    stub(418, { detail: 7 });
    await expect(api.loadSession()).rejects.toThrow("Anmeldestatus konnte nicht geladen werden (418).");
  });
});

describe("default client of the lib", () => {
  it("talks to /api/auth when no client is configured, and reuses it", async () => {
    const fetchMock = stub(200, { authRequired: false, user: null });
    const { createTestStore } = await import("../../../testing/index.js");
    const { loadAuthSession } = await import("../../../modules/auth/slice.js");
    const store = createTestStore();
    await store.dispatch(loadAuthSession() as never);
    await store.dispatch(loadAuthSession() as never);
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/session", expect.anything());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
