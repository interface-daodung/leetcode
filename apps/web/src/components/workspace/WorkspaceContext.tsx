import { createContext, useContext, useCallback, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Model, Actions, DockLocation } from "@leetcode/layout";
import { createDefaultLayout, defaultTabsetId, defaultTabJson, ALL_COMPONENTS } from "@leetcode/layout";
import type { LayoutComponentName } from "@leetcode/layout";
import type { ProblemMeta } from "@leetcode/shared";
import type { TestCaseResultView } from "../../lib/api.js";
import type { TabNode } from "@leetcode/layout";

const STORAGE_KEY = "lc:layout:json";
const MAX_UNDO = 50;

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

function jsonEqual(model: Model): string {
  return JSON.stringify(model.toJson());
}

/**
 * Custom undo hook – thay useUndo của FlexLayout, vì nó ghi undo step cho cả no-op.
 * Chỉ lưu undo khi model JSON thực sự thay đổi sau action.
 */
function useLayoutUndo(initializer: () => Model) {
  const [model, setModel] = useState<Model>(initializer);
  const modelRef = useRef(model);
  modelRef.current = model;

  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const beforeJson = useRef<string | null>(null);
  const adjustingStartJson = useRef<string | null>(null);

  // Gắn change listener — so sánh JSON trước/sau để skip no-op.
  // Bỏ qua SET_ACTIVE_TABSET (click/chuyển tab focus) — không tạo undo step.
  // Với drag gesture (adjusting): lưu snapshot lúc bắt đầu gesture, chỉ commit 1 undo step
  // khi gesture kết thúc và JSON thực sự khác snapshot (kéo ra-thả-về cùng chỗ = no-op).
  useEffect(() => {
    const listener = {
      onBeforeAction: (action: { type?: string; isAdjusting?: () => boolean }) => {
        if (action.type === Actions.SET_ACTIVE_TABSET) return;
        if (action.isAdjusting && action.isAdjusting()) {
          if (adjustingStartJson.current === null) {
            adjustingStartJson.current = jsonEqual(modelRef.current);
          }
          return;
        }
        beforeJson.current = jsonEqual(modelRef.current);
      },
      onAfterAction: (action: { type?: string; isAdjusting?: () => boolean }) => {
        if (action.type === Actions.SET_ACTIVE_TABSET) return;
        if (action.isAdjusting && action.isAdjusting()) {
          return;
        }
        if (adjustingStartJson.current !== null) {
          // Kết thúc gesture: so với snapshot đầu gesture
          const after = jsonEqual(modelRef.current);
          if (adjustingStartJson.current !== after) {
            undoStack.current.push(adjustingStartJson.current);
            if (undoStack.current.length > MAX_UNDO) undoStack.current.shift();
            redoStack.current = [];
            setCanUndo(true);
            setCanRedo(false);
          }
          adjustingStartJson.current = null;
          beforeJson.current = null;
          return;
        }
        const after = jsonEqual(modelRef.current);
        if (beforeJson.current !== null && beforeJson.current !== after) {
          undoStack.current.push(beforeJson.current);
          if (undoStack.current.length > MAX_UNDO) undoStack.current.shift();
          redoStack.current = [];
          setCanUndo(true);
          setCanRedo(false);
        }
        beforeJson.current = null;
      },
    };
    model.addChangeListener(listener);
    return () => {
      model.removeChangeListener(listener);
    };
  }, [model]);

  const undo = useCallback(() => {
    const current = modelRef.current;
    const json = undoStack.current.pop();
    if (!json) return;
    redoStack.current.push(jsonEqual(current));
    const next = Model.fromJson(JSON.parse(json), current);
    modelRef.current = next;
    setModel(next);
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
  }, []);

  const redo = useCallback(() => {
    const current = modelRef.current;
    const json = redoStack.current.pop();
    if (!json) return;
    undoStack.current.push(jsonEqual(current));
    const next = Model.fromJson(JSON.parse(json), current);
    modelRef.current = next;
    setModel(next);
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
  }, []);

  return { model, undo, redo, canUndo, canRedo };
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
  refreshPanelsVisible: () => void;
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

/** Đếm tab hiện có trong model cho từng component. */
function countTabs(model: Model): Record<LayoutComponentName, number> {
  const counts: Record<string, number> = {};
  for (const c of ALL_COMPONENTS) {
    counts[c] = 0;
  }
  model.visitNodes((node) => {
    if (node.getType() === "tab") {
      const tab = node as TabNode;
      const comp = tab.getComponent() as LayoutComponentName;
      if (comp && comp in counts) {
        counts[comp] += 1;
      }
    }
  });
  return counts as Record<LayoutComponentName, number>;
}

/** Tính trạng thái mở/đóng cho từng panel từ model. */
function computePanelsVisible(model: Model): Record<LayoutComponentName, boolean> {
  const counts = countTabs(model);
  const visible = {} as Record<LayoutComponentName, boolean>;
  for (const c of ALL_COMPONENTS) {
    visible[c] = counts[c] > 0;
  }
  return visible;
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(defaultState);
  const { model, undo, redo, canUndo, canRedo } = useLayoutUndo(loadModel);
  const persistTimer = useRef<number | null>(null);
  const [panelsVisible, setPanelsVisible] = useState<Record<LayoutComponentName, boolean>>({ explorer: true, editor: true, description: true, output: true, knowledge: true });

  // Theo dõi model thay đổi (useUndo replace model mỗi lần undo/redo, hoặc user thao tác layout)
  // → cập nhật panelsVisible + persist. (onModelChange của FlexLayout không fire khi useUndo replace model.)
  useEffect(() => {
    if (!model) return;
    const counts = countTabs(model);
    const visible = {} as Record<LayoutComponentName, boolean>;
    for (const c of ALL_COMPONENTS) {
      visible[c] = counts[c] > 0;
    }
    setPanelsVisible(visible);

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

  const persistModel = useCallback(() => {
    if (!model) return;
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

  const refreshPanelsVisible = useCallback(() => {
    if (!model) return;
    setPanelsVisible(computePanelsVisible(model));
  }, [model]);

  const reopenPanel = useCallback(
    (component: LayoutComponentName) => {
      if (!model) return;
      const counts = countTabs(model);
      if (counts[component] > 0) {
        // Đã có tab → focus tab đầu tiên của component
        let found = false;
        model.visitNodes((node) => {
          if (!found && node.getType() === "tab" && (node as TabNode).getComponent() === component) {
            found = true;
            model.doAction(Actions.selectTab(node.getId()));
          }
        });
        return;
      }

      // Chưa có tab → thêm về vị trí mặc định (hoặc tabset active / root row nếu tabset default đã bị xóa)
      const tabsetId = defaultTabsetId(component);
      const tabset = model.getNodeById(tabsetId);
      const target = tabset ?? model.getActiveTabset() ?? model.getRootRow();
      if (target) {
        model.doAction(Actions.addTab(defaultTabJson(component), target.getId(), DockLocation.CENTER, -1, true));
      }
    },
    [model],
  );

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
    model: model!,
    undo,
    redo,
    canUndo,
    canRedo,
    panelsVisible,
    reopenPanel,
    refreshPanelsVisible,
    persistModel,
  };

  return <WorkspaceCtx.Provider value={{ ...state, ...actions }}>{children}</WorkspaceCtx.Provider>;
}

export function useWorkspace() {
  return useContext(WorkspaceCtx);
}
