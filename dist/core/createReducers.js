import { combineReducers } from "@reduxjs/toolkit";
import { colorFieldModule } from "../modules/colorField/index.js";
import { dialogsModule } from "../modules/dialogs/index.js";
import { jobsModule } from "../modules/jobs/index.js";
import { portalThemeModule } from "../modules/portalTheme/index.js";
import { updaterModule } from "../modules/updater/index.js";
import { confirmModule } from "../modules/confirm/index.js";
/** Every module of the lib, in the order of their slices. */
export const ALL_REACT_LIB_MODULES = [
    portalThemeModule,
    dialogsModule,
    jobsModule,
    colorFieldModule,
    updaterModule,
    confirmModule,
];
export function createReactLibReducers(modules = ALL_REACT_LIB_MODULES) {
    const slices = {};
    for (const module of modules) {
        if (module.reducerKey !== undefined)
            slices[module.reducerKey] = module.reducer;
    }
    return combineReducers(slices);
}
/** The state of all lib components; mount it in the app's store: `{ [REACT_LIB_STATE_KEY]: reactLibReducer }`. */
export const reactLibReducer = createReactLibReducers();
