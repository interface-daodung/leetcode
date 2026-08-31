import type { ProblemMeta } from "@leetcode/shared";
import { languageTemplates } from "./templates.js";

/**
 * EditorTree — editor state dưới dạng cây file (IDE-like).
 *
 * - Node gốc là container (group).
 * - Leaf là file/tab chứa code.
 * - Mọi operation là pure: trả state mới, không mutate input.
 */

export type EditorNodeType = "root" | "group" | "file";

export interface EditorNode {
  id: string;
  type: EditorNodeType;
  name: string;
  language: string;
  code: string;
  dirty: boolean;
  savedAt?: number;
  children?: EditorNode[];
}

export interface EditorTreeState {
  root: EditorNode;
  activeId: string | null;
}

let nextId = 0;
function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(nextId++).toString(36)}`;
}

export function createFileNode(name: string, language = "javascript", code = "", id?: string): EditorNode {
  return { id: id ?? uid("file"), type: "file", name, language, code, dirty: false };
}

export function createGroupNode(name: string, children: EditorNode[] = [], type: EditorNodeType = "group"): EditorNode {
  return { id: uid("group"), type, name, language: "", code: "", dirty: false, children };
}

/** Tạo state rỗng với root container. */
export function createEditorTree(): EditorTreeState {
  return { root: createGroupNode("workspace", [], "root"), activeId: null };
}

/** Tìm node theo id (BFS trên cây). */
export function findNode(state: EditorTreeState, id: string): EditorNode | undefined {
  const visit = (node: EditorNode): EditorNode | undefined => {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = visit(child);
        if (found) return found;
      }
    }
    return undefined;
  };
  return visit(state.root);
}

function withUpdatedNode(node: EditorNode, id: string, update: (n: EditorNode) => EditorNode): EditorNode {
  if (node.id === id) return update(node);
  if (!node.children) return node;
  return { ...node, children: node.children.map((c) => withUpdatedNode(c, id, update)) };
}

/** Mở (hoặc tạo mới nếu chưa có) file theo id. Nếu file tồn tại → chuyển active. */
export function openFile(
  state: EditorTreeState,
  id: string,
  name: string,
  language = "javascript",
  code = "",
): EditorTreeState {
  const existing = findNode(state, id);
  if (existing) {
    return { ...state, activeId: id };
  }
  const file = createFileNode(name, language, code, id);
  const root = { ...state.root, children: [...(state.root.children ?? []), file] };
  return { root, activeId: id };
}

/** Cập nhật code của file (đánh dấu dirty). */
export function updateCode(state: EditorTreeState, id: string, code: string): EditorTreeState {
  if (!findNode(state, id)) return state;
  return { ...state, root: withUpdatedNode(state.root, id, (n) => ({ ...n, code, dirty: true })) };
}

/** Đánh dấu file đã lưu (dirty = false). */
export function markSaved(state: EditorTreeState, id: string): EditorTreeState {
  if (!findNode(state, id)) return state;
  return { ...state, root: withUpdatedNode(state.root, id, (n) => ({ ...n, dirty: false, savedAt: Date.now() })) };
}

/** Đóng file — xóa khỏi cây, active chuyển sang node lân cận nếu cần. */
export function closeFile(state: EditorTreeState, id: string): EditorTreeState {
  if (!findNode(state, id)) return state;

  let newActive = state.activeId;
  if (state.activeId === id) {
    const siblings = state.root.children ?? [];
    const idx = siblings.findIndex((n) => n.id === id);
    const next = siblings[idx - 1] ?? siblings[idx + 1];
    newActive = next?.type === "file" ? next.id : null;
  }

  const root: EditorNode = {
    ...state.root,
    children: (state.root.children ?? []).filter((n) => n.id !== id),
  };
  return { root, activeId: newActive };
}

/** Chuyển active sang file khác. */
export function setActive(state: EditorTreeState, id: string | null): EditorTreeState {
  if (id === null) return { ...state, activeId: null };
  if (!findNode(state, id)) return state;
  return { ...state, activeId: id };
}

/** Lấy danh sách file phẳng (để feed vào tabs của dockable layout). */
export function toFlatFiles(state: EditorTreeState): EditorNode[] {
  const files: EditorNode[] = [];
  const visit = (node: EditorNode) => {
    if (node.type === "file") {
      files.push(node);
      return;
    }
    if (node.children) node.children.forEach(visit);
  };
  visit(state.root);
  return files;
}

/** Tạo file từ template ngôn ngữ. */
export function createFileFromLanguage(name: string, language: string): EditorNode {
  return createFileNode(name, language, languageTemplates[language] ?? languageTemplates.javascript);
}

export function createEditorTreeFromProblem(problem?: ProblemMeta): EditorTreeState {
  const state = createEditorTree();
  if (problem) {
    const file = createFileFromLanguage(`${problem.title}.js`, "javascript");
    file.code = problem.template ?? languageTemplates.javascript;
    state.root.children = [file];
    state.activeId = file.id;
  }
  return state;
}
