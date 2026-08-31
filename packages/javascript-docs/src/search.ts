import indexData from "./data/index.json" with { type: "json" };
import arrayData from "./data/array-examples.json" with { type: "json" };
import conditionalsData from "./data/conditionals-examples.json" with { type: "json" };
import fccData from "./data/fcc-lessons.json" with { type: "json" };
import functionData from "./data/function-examples.json" with { type: "json" };
import loopData from "./data/loop-examples.json" with { type: "json" };
import notesData from "./data/notes.json" with { type: "json" };
import numberDateData from "./data/number-date-examples.json" with { type: "json" };
import objectData from "./data/object-examples.json" with { type: "json" };
import practicalData from "./data/practical-examples.json" with { type: "json" };
import reactData from "./data/react.json" with { type: "json" };
import readmeData from "./data/README.json" with { type: "json" };
import regexData from "./data/regex-examples.json" with { type: "json" };
import stringData from "./data/string-examples.json" with { type: "json" };
import type { DocsIndex, DocFile, DocSection, IndexEntry } from "./types.js";

// Cast JSON import để có type an toàn; `resolveJsonModule` đã bật
const index = indexData as unknown as DocsIndex;

const allDocFiles: DocFile[] = [
  arrayData as unknown as DocFile,
  conditionalsData as unknown as DocFile,
  fccData as unknown as DocFile,
  functionData as unknown as DocFile,
  loopData as unknown as DocFile,
  notesData as unknown as DocFile,
  numberDateData as unknown as DocFile,
  objectData as unknown as DocFile,
  practicalData as unknown as DocFile,
  reactData as unknown as DocFile,
  readmeData as unknown as DocFile,
  regexData as unknown as DocFile,
  stringData as unknown as DocFile,
];

// Lazy cache cho DocFile theo category/sourceFile
let docFilesCache: Map<string, DocFile> | null = null;

async function loadDocFiles(): Promise<Map<string, DocFile>> {
  if (docFilesCache) return docFilesCache;
  const map = new Map<string, DocFile>();
  for (const doc of allDocFiles) {
    map.set(doc.sourceFile, doc);
    map.set(doc.category, doc);
    map.set(doc.sourceFile.replace(".md", ""), doc);
    map.set(doc.sourceFile.replace(".md", ".json"), doc);
  }
  docFilesCache = map;
  return map;
}

function getDocFilesSync(): Map<string, DocFile> {
  const map = new Map<string, DocFile>();
  for (const doc of allDocFiles) {
    map.set(doc.sourceFile, doc);
    map.set(doc.category, doc);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Search core
// ---------------------------------------------------------------------------

export interface SearchOptions {
  /** giới hạn số kết quả (mặc định 20) */
  limit?: number;
  /** lọc theo category chính xác */
  category?: string;
  /** chỉ trả về entry có keyword khớp */
  keyword?: string;
  /** match chính xác title */
  exactTitle?: boolean;
  /** case sensitive (mặc định false) */
  caseSensitive?: boolean;
}

/**
 * Chuẩn hoá query: lower-case, trim, bỏ ký tự đặc biệt dư.
 */
function normalize(q: string, caseSensitive = false): string {
  let s = q.trim();
  if (!caseSensitive) s = s.toLowerCase();
  // giữ chữ, số, dấu - và khoảng trắng
  s = s.replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
  return s;
}

function scoreEntry(entry: IndexEntry, tokens: string[]): number {
  let score = 0;
  const titleLower = entry.title.toLowerCase();
  const searchLower = entry.searchText.toLowerCase();
  const keywordsLower = entry.keywords.map((k) => k.toLowerCase());

  for (const tok of tokens) {
    if (!tok) continue;
    if (titleLower === tok) score += 100;
    else if (titleLower.includes(tok)) score += 50;
    else if (keywordsLower.includes(tok)) score += 30;
    else if (keywordsLower.some((k) => k.includes(tok))) score += 15;
    else if (searchLower.includes(tok)) score += 10;
    else if (entry.summary.toLowerCase().includes(tok)) score += 5;

    // bonus nếu syntax chứa token
    if (entry.syntax && entry.syntax.toLowerCase().includes(tok)) score += 20;
  }
  // bonus nhẹ cho category match (khi query chứa tên category)
  return score;
}

/**
 * Tìm kiếm toàn văn trên index.
 * - Token hoá query thành các từ, tính điểm theo title/keywords/syntax/searchText
 * - Trả về danh sách IndexEntry đã sort theo score giảm dần
 *
 * @example searchDocs("array push mutate") → [{id:"array-push", ...}]
 * @example searchDocs("string split", {category:"string", limit:5})
 */
export function searchDocs(query: string, opts: SearchOptions = {}): IndexEntry[] {
  const { limit = 20, category, keyword, exactTitle, caseSensitive } = opts;
  const qNorm = normalize(query, caseSensitive);
  if (!qNorm && !category && !keyword) return [];

  const tokens = qNorm ? qNorm.split(" ").filter(Boolean) : [];

  let pool: IndexEntry[] = (index as DocsIndex).entries;

  // Lọc theo category nếu chỉ định
  if (category) {
    const catLower = category.toLowerCase();
    pool = pool.filter((e) => e.category.toLowerCase() === catLower);
  }

  // Lọc theo keyword nếu chỉ định
  if (keyword) {
    const kwLower = keyword.toLowerCase();
    const ids = (index as DocsIndex).keywordIndex[kwLower] ?? [];
    const idSet = new Set(ids.map((id) => id.toLowerCase()));
    pool = pool.filter((e) => idSet.has(e.id.toLowerCase()) || e.keywords.map((k) => k.toLowerCase()).includes(kwLower));
  }

  // Nếu exactTitle
  if (exactTitle && qNorm) {
    return pool.filter((e) => e.title.toLowerCase() === qNorm).slice(0, limit);
  }

  // Nếu không có token nhưng có filter → trả pool đã sort theo title
  if (tokens.length === 0) {
    return [...pool].sort((a, b) => a.title.localeCompare(b.title)).slice(0, limit);
  }

  // Tính điểm và lọc score > 0
  const scored = pool
    .map((e) => ({ e, score: scoreEntry(e, tokens) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.e.title.localeCompare(b.e.title))
    .map((x) => x.e)
    .slice(0, limit);

  return scored;
}

/**
 * Gợi ý lệnh/autocomplete dựa trên prefix của title hoặc keyword.
 * Dùng cho dịch vụ nhắc lệnh (prompt suggestion).
 */
export function suggestCommands(prefix: string, limit = 10): IndexEntry[] {
  const p = normalize(prefix);
  if (!p) return [];
  const pool = (index as DocsIndex).entries;
  const scored = pool
    .filter((e) => e.title.toLowerCase().startsWith(p) || e.keywords.some((k) => k.toLowerCase().startsWith(p)))
    .sort((a, b) => a.title.length - b.title.length || a.title.localeCompare(b.title))
    .slice(0, limit);
  // nếu ít kết quả, bổ sung fuzzy contains
  if (scored.length < limit) {
    const extra = pool
      .filter((e) => !scored.includes(e) && (e.searchText.includes(p) || e.title.toLowerCase().includes(p)))
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, limit - scored.length);
    return [...scored, ...extra];
  }
  return scored;
}

/**
 * Lấy entry theo id chính xác
 */
export function getById(id: string): IndexEntry | undefined {
  const lower = id.toLowerCase();
  return (index as DocsIndex).entries.find((e) => e.id.toLowerCase() === lower);
}

/**
 * Lấy tất cả entry thuộc 1 category
 */
export function getByCategory(category: string): IndexEntry[] {
  return searchDocs("", { category, limit: 1000 });
}

/**
 * Lấy tất cả entry chứa keyword
 */
export function getByKeyword(keyword: string): IndexEntry[] {
  return searchDocs("", { keyword, limit: 1000 });
}

/**
 * Lấy danh sách keywords duy nhất (sorted)
 */
export function getAllKeywords(): string[] {
  return Object.keys((index as DocsIndex).keywordIndex).sort();
}

/**
 * Lấy danh sách categories
 */
export function getCategories(): string[] {
  return [...(index as DocsIndex).categories];
}

/**
 * Lấy toàn bộ index (read-only)
 */
export function getIndex(): DocsIndex {
  return index as DocsIndex;
}

/**
 * Lấy DocFile đầy đủ (bao gồm sections + examples + tables) theo category hoặc file name.
 * Cần `await` vì import động.
 */
export async function getDocFile(categoryOrFile: string): Promise<DocFile | undefined> {
  const map = await loadDocFiles();
  // thử trực tiếp
  if (map.has(categoryOrFile)) return map.get(categoryOrFile);
  // thử lower-case
  const lower = categoryOrFile.toLowerCase();
  for (const [k, v] of map) {
    if (k.toLowerCase() === lower) return v;
  }
  // thử với .md/.json suffix
  const withMd = lower.endsWith(".md") ? lower : `${lower}.md`;
  if (map.has(withMd)) return map.get(withMd);
  // thử tìm theo sourceFile chứa category
  for (const v of map.values()) {
    if (v.category.toLowerCase() === lower) return v;
  }
  return undefined;
}

/**
 * Lấy 1 section chi tiết theo id (cần load DocFile)
 */
export async function getSectionById(id: string): Promise<DocSection | undefined> {
  const entry = getById(id);
  if (!entry) return undefined;
  const doc = await getDocFile(entry.sourceFile);
  if (!doc) return undefined;
  return doc.sections.find((s) => s.id.toLowerCase() === id.toLowerCase());
}

/**
 * Đồng bộ: lấy DocFile ngay lập tức (không cần await) — dùng static map
 */
export function getDocFileSync(categoryOrFile: string): DocFile | undefined {
  const map = getDocFilesSync();
  if (map.has(categoryOrFile)) return map.get(categoryOrFile);
  const lower = categoryOrFile.toLowerCase();
  for (const [k, v] of map) if (k.toLowerCase() === lower) return v;
  const withMd = lower.endsWith(".md") ? lower : `${lower}.md`;
  if (map.has(withMd)) return map.get(withMd);
  for (const v of map.values()) if (v.category.toLowerCase() === lower) return v;
  return undefined;
}

export function getSectionByIdSync(id: string): DocSection | undefined {
  const entry = getById(id);
  if (!entry) return undefined;
  const doc = getDocFileSync(entry.sourceFile);
  if (!doc) return undefined;
  return doc.sections.find((s) => s.id.toLowerCase() === id.toLowerCase());
}

/** Lấy toàn bộ DocFile (static, sync) */
export function getAllDocFiles(): DocFile[] {
  return [...allDocFiles];
}

/**
 * Alias giữ tương thích với API cũ `getDoc(topic)`
 * Trả về IndexEntry đầu tiên khớp title
 */
export function getDoc(topic: string): IndexEntry | undefined {
  return searchDocs(topic, { limit: 1, exactTitle: false })[0] ?? getById(topic);
}
