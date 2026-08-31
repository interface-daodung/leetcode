import { createContext, useContext, useCallback, useState } from "react";
import type { ReactNode } from "react";
import type { ProblemMeta } from "@leetcode/shared";
import type { TestCaseResultView } from "../../lib/api.js";

export interface WorkspaceState {
  problem: ProblemMeta | null;
  code: string;
  results: TestCaseResultView[] | null;
  runPassed: number;
  runTotal: number;
  loading: boolean;
  output: string;
  showHints: boolean;
  vscodeMsg: string | null;
  running: boolean;
}

export interface WorkspaceActions {
  setProblem: (p: ProblemMeta | null) => void;
  setCode: (code: string) => void;
  setResults: (r: TestCaseResultView[] | null) => void;
  setRunPassed: (n: number) => void;
  setRunTotal: (n: number) => void;
  setLoading: (b: boolean) => void;
  setOutput: (s: string) => void;
  setShowHints: (b: boolean) => void;
  setVscodeMsg: (s: string | null) => void;
  setRunning: (b: boolean) => void;
}

const WorkspaceCtx = createContext<WorkspaceState & WorkspaceActions>(null!);

const defaultState: WorkspaceState = {
  problem: null,
  code: "",
  results: null,
  runPassed: 0,
  runTotal: 0,
  loading: false,
  output: "",
  showHints: false,
  vscodeMsg: null,
  running: false,
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(defaultState);

  const actions: WorkspaceActions = {
    setProblem: useCallback((p) => setState((s) => ({ ...s, problem: p })), []),
    setCode: useCallback((code) => setState((s) => ({ ...s, code })), []),
    setResults: useCallback((r) => setState((s) => ({ ...s, results: r })), []),
    setRunPassed: useCallback((n) => setState((s) => ({ ...s, runPassed: n })), []),
    setRunTotal: useCallback((n) => setState((s) => ({ ...s, runTotal: n })), []),
    setLoading: useCallback((b) => setState((s) => ({ ...s, loading: b })), []),
    setOutput: useCallback((s) => setState((o) => ({ ...o, output: s })), []),
    setShowHints: useCallback((b) => setState((s) => ({ ...s, showHints: b })), []),
    setVscodeMsg: useCallback((s) => setState((o) => ({ ...o, vscodeMsg: s })), []),
    setRunning: useCallback((b) => setState((s) => ({ ...s, running: b })), []),
  };

  return <WorkspaceCtx.Provider value={{ ...state, ...actions }}>{children}</WorkspaceCtx.Provider>;
}

export function useWorkspace() {
  return useContext(WorkspaceCtx);
}