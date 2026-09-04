import type { SuggestItem } from "./types.js";

/** Từ khóa JS hay dùng khi giải LeetCode (tập hữu hạn, không cần liệt kê hết ES). */
const KEYWORDS = [
  "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
  "switch", "case", "break", "continue", "new", "class", "try", "catch", "throw",
  "typeof", "instanceof", "in", "of", "delete", "void", "null", "undefined",
  "true", "false", "this", "=>",
];

export const keywordItems: SuggestItem[] = KEYWORDS.map((k) => ({
  id: `keyword.${k}`,
  label: k,
  kind: "keyword",
  insertText: k === "const" || k === "let" || k === "var" || k === "return" || k === "typeof" ? `${k} ` : k,
  priority: 100,
}));
