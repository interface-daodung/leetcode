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
      const json = JSON.parse(raw);
      migrateLayoutJson(json);
      return Model.fromJson(json);
    }
  } catch {
    // bỏ qua, dùng default
  }
  return Model.fromJson(createDefaultLayout());
}

/**
 * Migrate layout JSON lưu trong localStorage:
 * - Tab "knowledge" (panel cũ gộp search+result) → tab "knowledge-search" (result mở qua panel riêng)
 * - Thêm tabset "tabset-knowledge-result" (chi tiết kết quả) cạnh tabset-output nếu chưa có
 */
function migrateLayoutJson(json: { layout?: { children?: unknown[] } }): void {
  if (!json.layout || !Array.isArray(json.layout.children)) return;

  const rootRow = json.layout;

  const visitTabsets = (fn: (tabset: { id?: string; children?: Array<Record<string, unknown>> }) => void): void => {
    const walk = (node: unknown): void => {
      if (!node || typeof node !== "object") return;
      const n = node as { type?: string; id?: string; children?: unknown[] };
      if (n.type === "tabset") {
        fn(n as { id?: string; children?: Array<Record<string, unknown>> });
      }
      if (Array.isArray(n.children)) {
        for (const child of n.children) walk(child);
      }
    };
    walk(rootRow);
  };

  // 1) Đổi component "knowledge" → "knowledge-search" (panel cũ gộp giờ chỉ còn phần search)
  let hadKnowledgeTab = false;
  visitTabsets((tabset) => {
    if (!Array.isArray(tabset.children)) return;
    for (const tab of tabset.children) {
      if (tab && typeof tab === "object" && (tab as { component?: string }).component === "knowledge") {
        (tab as { component: string }).component = "knowledge-search";
        hadKnowledgeTab = true;
      }
    }
  });

  // 2) Nếu user còn tab knowledge → thêm tabset-knowledge-result (chứa tab result) cạnh tabset-output
  let hasKnowledgeResultTabset = false;
  visitTabsets((tabset) => {
    if (tabset.id === "tabset-knowledge-result") hasKnowledgeResultTabset = true;
  });
  if (hadKnowledgeTab && !hasKnowledgeResultTabset) {
    const outputTabset = findTabset(rootRow, "tabset-output");
    const parentRow = findParentRow(rootRow, "tabset-output");
    if (outputTabset && parentRow && Array.isArray(parentRow.children)) {
      parentRow.children.splice(parentRow.children.indexOf(outputTabset) + 1, 0, {
        type: "tabset",
        id: "tabset-knowledge-result",
        children: [{ type: "tab", name: "Knowledge Result", component: "knowledge-result" }],
      });
    }
  }
}

/** Tìm tabset theo id trong cây layout JSON. */
function findTabset(node: unknown, id: string): Record<string, unknown> | undefined {
  if (!node || typeof node !== "object") return undefined;
  const n = node as { type?: string; id?: string; children?: unknown[] };
  if (n.type === "tabset" && n.id === id) return n as Record<string, unknown>;
  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      const found = findTabset(child, id);
      if (found) return found;
    }
  }
  return undefined;
}

/** Tìm row cha trực tiếp chứa tabset với id cho trước. */
function findParentRow(node: unknown, tabsetId: string): Record<string, unknown> | undefined {
  if (!node || typeof node !== "object") return undefined;
  const n = node as { type?: string; children?: unknown[] };
  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      const c = child as { type?: string; id?: string } | null;
      if (c && c.type === "tabset" && c.id === tabsetId) return n as Record<string, unknown>;
      const found = findParentRow(child, tabsetId);
      if (found) return found;
    }
  }
  return undefined;
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
  focusPanelTab: (component: LayoutComponentName) => void;
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
  const [panelsVisible, setPanelsVisible] = useState<Record<LayoutComponentName, boolean>>({
    explorer: true,
    editor: true,
    description: true,
    output: true,
    "knowledge-search": true,
    "knowledge-result": true,
    ai: true,
    error: true,
  });

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

  /**
   * Focus tab của component; nếu chưa có tab nào thì thêm về tabset mặc định.
   * Khác reopenPanel: dùng khi panel A muốn "mở sang" panel B (vd bấm kết quả search
   * → mở tab Knowledge Result), không cần refreshPanelsVisible từ menu View.
   */
  const focusPanelTab = useCallback(
    (component: LayoutComponentName) => {
      reopenPanel(component);
      refreshPanelsVisible();
    },
    [reopenPanel, refreshPanelsVisible],
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
    focusPanelTab,
    refreshPanelsVisible,
    persistModel,
  };

  return <WorkspaceCtx.Provider value={{ ...state, ...actions }}>{children}</WorkspaceCtx.Provider>;
}

export function useWorkspace() {
  return useContext(WorkspaceCtx);
}
