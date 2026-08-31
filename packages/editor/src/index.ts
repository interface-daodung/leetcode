import type { ProblemMeta } from "@leetcode/shared";
import { languageTemplates } from "./templates.js";
import {
  createEditorTree,
  createEditorTreeFromProblem,
  createFileFromLanguage,
  createFileNode,
  createGroupNode,
  findNode,
  openFile,
  updateCode,
  markSaved,
  closeFile,
  setActive,
  toFlatFiles,
} from "./editorTree.js";
import type { EditorNode, EditorNodeType, EditorTreeState } from "./editorTree.js";

export interface EditorState {
  code: string;
  language: string;
  problemId?: number;
}

export function createEditorState(problem?: ProblemMeta): EditorState {
  return {
    code: "",
    language: "javascript",
    problemId: problem?.id,
  };
}

export { languageTemplates };

// EditorTree state/tree model
export {
  createEditorTree,
  createEditorTreeFromProblem,
  createFileFromLanguage,
  createFileNode,
  createGroupNode,
  findNode,
  openFile,
  updateCode,
  markSaved,
  closeFile,
  setActive,
  toFlatFiles,
};
export type { EditorNode, EditorNodeType, EditorTreeState };
