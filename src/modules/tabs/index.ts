import { Tabs } from "./Tabs.js";
import { tabsReducer } from "./slice.js";

/** Module form: `reducerKey` + `reducer` for `createReactLibReducers`, `components` for the UI. */
export const tabsModule = {
  reducerKey: "tabs",
  reducer: tabsReducer,
  components: { Tabs },
} as const;

export { Tabs, useActiveTab } from "./Tabs.js";
export { tabSelected, type TabsState } from "./slice.js";
export type { TabItem, TabsProps } from "./types.js";
