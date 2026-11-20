import { Tabs } from "./Tabs.js";
/** Module form: `reducerKey` + `reducer` for `createReactLibReducers`, `components` for the UI. */
export declare const tabsModule: {
    readonly reducerKey: "tabs";
    readonly reducer: import("@reduxjs/toolkit").Reducer<import("./slice.js").TabsState>;
    readonly components: {
        readonly Tabs: typeof Tabs;
    };
};
export { Tabs, useActiveTab } from "./Tabs.js";
export { tabSelected, type TabsState } from "./slice.js";
export type { TabItem, TabsProps } from "./types.js";
