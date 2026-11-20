export interface TabsState {
    /** Active tab id per tab group. */
    active: Record<string, string>;
}
export declare const tabSelected: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    group: string;
    tab: string;
}, "tabs/tabSelected">;
export declare const tabsReducer: import("@reduxjs/toolkit").Reducer<TabsState>;
