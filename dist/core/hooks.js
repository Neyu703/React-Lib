import { useDispatch, useSelector, useStore } from "react-redux";
import { REACT_LIB_STATE_KEY } from "./stateKey.js";
export const selectReactLib = (root) => root[REACT_LIB_STATE_KEY];
export const useReactLibSelector = (select) => useSelector((root) => select(selectReactLib(root)));
export const useReactLibDispatch = () => useDispatch();
/** For reading the current state inside event handlers and effects without subscribing to it. */
export const useReactLibStore = () => useStore();
