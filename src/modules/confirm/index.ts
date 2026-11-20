import { ConfirmView } from "./ConfirmView.js";

/** Module form without state: no `reducerKey` / `reducer`, only `components`. */
export const confirmModule = {
  components: { ConfirmView },
} as const;

export { ConfirmView };
export type { ConfirmViewProps } from "./types.js";
