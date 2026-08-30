import type { ProblemMeta } from "@leetcode/shared";

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

export const languageTemplates: Record<string, string> = {
  javascript: "// Your solution here\nfunction solution() {\n  \n}",
  python: "# Your solution here\ndef solution():\n    pass",
  typescript: "// Your solution here\nfunction solution(): void {\n  \n}",
};