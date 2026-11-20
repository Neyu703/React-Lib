import { configureReactLib } from "../core/host.js";
/** Puts the host handlers back to their harmless defaults; call it after each test. */
export function resetReactLib() {
    configureReactLib({});
}
