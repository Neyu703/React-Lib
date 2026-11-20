import { ColorField } from "./ColorField.js";
import { colorFieldReducer } from "./slice.js";
/** Module form: `reducerKey` + `reducer` for `createReactLibReducers`, `components` for the UI. */
export const colorFieldModule = {
    reducerKey: "colorField",
    reducer: colorFieldReducer,
    components: { ColorField },
};
export { ColorField };
export { customColorsSet } from "./slice.js";
