import type { ReactNode } from "react";
import type { AuthUser } from "./types.js";
export interface LoginGateProps {
    readonly children: ReactNode;
    /** Program name above the sign-in button. */
    readonly title?: string;
    /** Shown while the sign-in state loads. */
    readonly loading?: ReactNode;
}
/** The person and the sign-out for components below `LoginGate`; reads the store, needs no provider. */
export declare function useAuth(): {
    readonly user: AuthUser | null;
    readonly signOut: () => Promise<void>;
};
/** Shows the children only when no sign-in is needed or a person is signed in. */
export declare function LoginGate({ children, title, loading }: LoginGateProps): import("react").JSX.Element;
