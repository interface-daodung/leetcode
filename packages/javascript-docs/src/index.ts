/**
 * @leetcode/javascript-docs — entry point
 *
 * Nguồn .md tại `src/docs/en|vi` → generate.py → JSON → seeder → SQLite
 * (bảng doc_files/doc_sections, @leetcode/database). Data nạp vào module qua
 * `setDocsData()` — server nạp từ DB khi boot; trước đây import tĩnh JSON đã bỏ.
 *
 * Cung cấp:
 * - Types (src/types.ts)
 * - Search & suggest (src/search.ts) — pure, cần setDocsData() trước
 * - Code suggest (src/suggest/) — static assets, không cần DB
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
  buildKeywordIndex,
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
  setDocsData,
  suggestCommands,
  suggestCommandsVi,
} from "./search.js";

// Alias mới từ search (tìm trên index) — tránh trùng tên với legacy getDoc ở trên
export { getDoc as searchGetDoc } from "./search.js";

// Bộ nhắc code (autocomplete LeetCode JS)
export type { SuggestItem, SuggestContext } from "./suggest/index.js";
export {
  detectContext,
  extractVars,
  getAllSuggestItems,
  MEMBER_ITEMS,
  snippetItems,
  suggest,
  suggestForCode,
  VALUE_ITEMS,
} from "./suggest/index.js";

// Index đã nạp (lazy — server/web gọi setDocsData() trước rồi mới docsIndex)
import { getIndex as _getIndex } from "./search.js";
export const docsIndex = new Proxy({} as ReturnType<typeof _getIndex>, {
  get(_t, prop) {
    return Reflect.get(_getIndex(), prop);
  },
});
