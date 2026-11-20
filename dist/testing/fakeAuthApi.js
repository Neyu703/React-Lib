/** An auth client that needs no server: sign-in switched off, every call succeeds; override what a test needs. */
export function fakeAuthApi(overrides = {}) {
    return {
        loadSession: () => Promise.resolve({ authRequired: false, user: null }),
        signIn: () => Promise.resolve({ authRequired: false, user: null }),
        signOut: () => Promise.resolve(),
        ...overrides,
    };
}
