import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useReactLibSelector, useReactLibThunk } from "../../core/hooks.js";
import { loadAuthSession, signInAuth, signOutAuth } from "./slice.js";
/** The person and the sign-out for components below `LoginGate`; reads the store, needs no provider. */
export function useAuth() {
    const dispatch = useReactLibThunk();
    const user = useReactLibSelector((state) => state.auth.user);
    return { user, signOut: async () => void (await dispatch(signOutAuth())) };
}
/** Shows the children only when no sign-in is needed or a person is signed in. */
export function LoginGate({ children, title, loading = null }) {
    const dispatch = useReactLibThunk();
    const phase = useReactLibSelector((state) => state.auth.phase);
    const message = useReactLibSelector((state) => state.auth.message);
    const signingIn = useReactLibSelector((state) => state.auth.signingIn);
    useEffect(() => {
        const request = dispatch(loadAuthSession());
        return () => request.abort();
    }, [dispatch]);
    if (phase === "loading")
        return _jsx(_Fragment, { children: loading });
    if (phase === "failed") {
        return (_jsx("main", { className: "auth-gate", children: _jsx("p", { className: "auth-gate-error", role: "alert", children: message }) }));
    }
    if (phase === "login") {
        return (_jsx("main", { className: "auth-gate", children: _jsxs("section", { className: "auth-gate-card", children: [title !== undefined && _jsx("h1", { children: title }), _jsx("p", { children: "Anmeldung erforderlich" }), _jsx("button", { type: "button", className: "auth-gate-button", disabled: signingIn, onClick: () => void dispatch(signInAuth()), children: signingIn ? "Anmeldung läuft …" : "Mit Microsoft anmelden" }), message !== null && (_jsx("p", { className: "auth-gate-error", role: "alert", children: message }))] }) }));
    }
    return _jsx(_Fragment, { children: children });
}
