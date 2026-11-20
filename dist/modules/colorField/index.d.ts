import { ColorField } from "./ColorField.js";
/** Module form: `reducerKey` + `reducer` for `createReactLibReducers`, `components` for the UI. */
export declare const colorFieldModule: {
    readonly reducerKey: "colorField";
    readonly reducer: import("@reduxjs/toolkit").Reducer<import("./slice.js").ColorFieldState>;
    readonly components: {
        readonly ColorField: typeof ColorField;
    };
};
export { ColorField };
export { customColorsSet, type ColorFieldState } from "./slice.js";
export type { CustomColorsResponse } from "./types.js";
