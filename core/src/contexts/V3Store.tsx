import React, { createContext, useContext, useReducer, ReactNode } from "react";
import type { ViewId, PlaygroundMode } from "../types";

export interface V3State {
  activeView: ViewId;
  selectedDayId: number | null;
  activeModuleId: number | null;
  activeProblemId: string | null;
  playgroundMode: PlaygroundMode;
  isSidebarOpen: boolean;
  // UI preferences
  theme: "dark" | "light";
}

type Action =
  | { type: "SET_VIEW"; payload: ViewId }
  | { type: "SET_DAY"; payload: number | null }
  | { type: "SET_MODULE"; payload: number | null }
  | { type: "SET_PROBLEM"; payload: string | null }
  | { type: "SET_PLAYGROUND_MODE"; payload: PlaygroundMode }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_THEME"; payload: "dark" | "light" };

const initialState: V3State = {
  activeView: "roadmap",
  selectedDayId: null,
  activeModuleId: null,
  activeProblemId: null,
  playgroundMode: "free",
  isSidebarOpen: true,
  theme: "dark",
};

function v3Reducer(state: V3State, action: Action): V3State {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, activeView: action.payload };
    case "SET_DAY":
      return { ...state, selectedDayId: action.payload };
    case "SET_MODULE":
      return { ...state, activeModuleId: action.payload };
    case "SET_PROBLEM":
      return { ...state, activeProblemId: action.payload };
    case "SET_PLAYGROUND_MODE":
      return { ...state, playgroundMode: action.payload };
    case "TOGGLE_SIDEBAR":
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    default:
      return state;
  }
}

// Split contexts to prevent re-renders in components that only need dispatch
const V3StateContext = createContext<V3State | null>(null);
const V3DispatchContext = createContext<React.Dispatch<Action> | null>(null);

export function V3StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(v3Reducer, initialState);
  return (
    <V3StateContext.Provider value={state}>
      <V3DispatchContext.Provider value={dispatch}>
        {children}
      </V3DispatchContext.Provider>
    </V3StateContext.Provider>
  );
}

export function useV3State() {
  const context = useContext(V3StateContext);
  if (!context) {
    throw new Error("useV3State must be used within a V3StoreProvider");
  }
  return context;
}

export function useV3Dispatch() {
  const context = useContext(V3DispatchContext);
  if (!context) {
    throw new Error("useV3Dispatch must be used within a V3StoreProvider");
  }
  return context;
}

// Deprecated: use useV3State and useV3Dispatch separately
export function useV3Store() {
  const state = useV3State();
  const dispatch = useV3Dispatch();
  return { state, dispatch };
}
