import { createContext, useContext, useCallback, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Model, Actions, DockLocation, useUndo } from "@leetcode/layout";
import { createDefaultLayout, defaultTabsetId, defaultTabJson, ALL_COMPONENTS } from "@leetcode/layout";
import type { LayoutComponentName } from "@leetcode/layout";
import type { ProblemMeta } from "@leetcode/shared";
import type { TestCaseResultView } from "../../lib/api.js";

const STORAGE_KEY = "lc:layout:json";

function loadModel(): Model {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return Model.fromJson(JSON.parse(raw));
    }
  } catch {
    // bỏ qua, dùng default
  }
  return Model.fromJson(createDefaultLayout());
}

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
  model: Model;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  panelsVisible: Record<LayoutComponentName, boolean>;
  reopenPanel: (component: LayoutComponentName) => void;
  persistModel: () => void;
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

function getPanelsVisible(model: Model): Record<LayoutComponentName, boolean> {
  const visible: Record<string, boolean> = {};
  for (const c of ALL_COMPONENTS) {
    visible[c] = false;
  }
  for (const node of model.getNodesByType("tab")) {
    const comp = node.getComponent() as LayoutComponentName;
    if (comp && comp in visible) {
      visible[comp] = true;
    }
  }
  return visible as Record<LayoutComponentName, boolean>;
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(defaultState);
  const { model, setModel, undo, redo, canUndo, canRedo } = useUndo(loadModel, { ignoreActionTypes: [Actions.SET_ACTIVE_TABSET] });
  const persistTimer = useRef<number | null>(null);
  const [panelsVisible, setPanelsVisible] = useState<Record<LayoutComponentName, boolean>>(() => getPanelsVisible(model));

  // Theo dõi model thay đổi → cập nhật panelsVisible
  // Dùng keydown để đếm số lần model thay đổi (không có callback onModelChange ở đây)
  useEffect(() => {
    const update = () => setPanelsVisible(getPanelsVisible(model));
    // useUndo replace model → cần re-run
    update();
  }, [model]);

  const persistModel = useCallback(() => {
    if (persistTimer.current !== null) {
      window.clearTimeout(persistTimer.current);
    }
    persistTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(model.toJson()));
      } catch {
        // storage đầy / private mode → bỏ qua
      }
    }, 500);
  }, [model]);

  const reopenPanel = useCallback((component: LayoutComponentName) => {
    const visible = getPanelsVisible(model);
    if (visible[component]) {
      // Đã có tab → focus tab đầu tiên
      for (const node of model.getNodesByType("tab")) {
        if (node.getComponent() === component) {
          model.doAction(Actions.selectTab(node.getId()));
          return;
        }
      }
      return;
    }

    // Thử thêm vào tabset mặc định
    const tabsetId = defaultTabsetId(component);
    const tabset = model.getNodeById(tabsetId);
    if (tabset) {
      model.doAction(Actions.addTab(defaultTabJson(component), tabsetId, DockLocation.CENTER, -1, true));
    } else {
      // Tabset mặc định đã bị xóa → tạo tabset mới
      model.doAction(Actions.addTabToNewGroup(defaultTabJson(component), undefined, component));
    }
  }, [model]);

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
    model,
    undo,
    redo,
    canUndo,
    canRedo,
    panelsVisible,
    reopenPanel,
    persistModel,
  };

  return <WorkspaceCtx.Provider value={{ ...state, ...actions }}>{children}</WorkspaceCtx.Provider>;
}

export function useWorkspace() {
  return useContext(WorkspaceCtx);
}