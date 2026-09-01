/**
 * @leetcode/javascript-docs — entry point
 *
 * Dữ liệu được sinh từ https://github.com/Kernix13/javascript-cheat-sheet
 * (clone vào `tmp_reference/`, parse → `src/data/*.json`)
 *
 * Cung cấp:
 * - Types (src/types.ts)
 * - Search & suggest (src/search.ts)
 * - Raw JSON data qua `getIndex()` / `getDocFile()`
 */

// Legacy interface giữ tương thích — đánh dấu deprecated, khuyến nghị dùng IndexEntry
export interface DocEntry {
  topic: string;
  content: string;
  examples: string[];
}

/** @deprecated — dữ liệu placeholder cũ, giữ để không vỡ import. Dùng `searchDocs()` hoặc `getIndex()` thay thế */
export const jsDocs: DocEntry[] = [
  {
    topic: "Array Methods",
    content: "Common array methods for problem solving",
    examples: ["map, filter, reduce", "find, findIndex, includes", "slice, splice, concat"],
  },
  {
    topic: "String Methods",
    content: "String manipulation for LeetCode",
    examples: ["split, join, replace", "charAt, charCodeAt", "substring, slice"],
  },
];

/** @deprecated — dùng `getById()` hoặc `searchDocs()` từ `search.ts` */
export function getDoc(topic: string): DocEntry | undefined {
  return jsDocs.find((d) => d.topic.toLowerCase() === topic.toLowerCase());
}

// Re-export toàn bộ API mới — consumer chỉ cần import từ `@leetcode/javascript-docs`
export type {
  DocFile,
  DocSection,
  DocsIndex,
  Example,
  IndexEntry,
  KeywordIndex,
} from "./types.js";

export {
  getAllDocFiles,
  getAllDocFilesVi,
  getAllKeywords,
  getAllKeywordsVi,
  getByCategory,
  getByCategoryVi,
  getById,
  getByIdVi,
  getByKeyword,
  getByKeywordVi,
  getCategories,
  getCategoriesVi,
  getDocFile,
  getDocFileSync,
  getDocFileSyncVi,
  getDocFileVi,
  getDocVi,
  getIndex,
  getIndexVi,
  getSectionById,
  getSectionByIdSync,
  getSectionByIdSyncVi,
  getSectionByIdVi,
  searchDocs,
  searchDocsVi,
  suggestCommands,
  suggestCommandsVi,
} from "./search.js";

// Alias mới từ search (tìm trên index) — tránh trùng tên với legacy getDoc ở trên
export { getDoc as searchGetDoc } from "./search.js";

// Export index đã build sẵn để consumer dùng nhanh mà không cần gọi getIndex()
import { getIndex as _getIndex } from "./search.js";
export const docsIndex = _getIndex();
