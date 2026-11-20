import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";
import { REACT_LIB_STATE_KEY } from "./stateKey.js";
import type { ReactLibState } from "./createReducers.js";

type HostState = { [REACT_LIB_STATE_KEY]: ReactLibState };

export const selectReactLib = (root: HostState): ReactLibState => root[REACT_LIB_STATE_KEY];

export const useReactLibSelector = <Selected>(
  select: (state: ReactLibState) => Selected,
): Selected => useSelector((root: HostState) => select(selectReactLib(root)));

export const useReactLibDispatch = (): Dispatch<UnknownAction> => useDispatch();

/** For reading the current state inside event handlers and effects without subscribing to it. */
export const useReactLibStore = () => useStore<HostState>();
