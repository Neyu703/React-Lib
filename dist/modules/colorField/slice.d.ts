export interface ColorFieldState {
    /** The user's own colours, shown in every colour field's palette. */
    customColors: string[];
}
export declare const customColorsSet: import("@reduxjs/toolkit").ActionCreatorWithPayload<string[], "colorField/customColorsSet">;
export declare const colorFieldReducer: import("@reduxjs/toolkit").Reducer<ColorFieldState>;
