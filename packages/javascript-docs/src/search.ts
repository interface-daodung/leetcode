/**
 * Search core — pure logic, data nạp qua `setDocsData()`.
 *
 * Trước đây file này import tĩnh 28 JSON từ src/data/{en,vi} (~5MB bundle).
 * Giờ DB (SQLite, bảng doc_files/doc_sections) là nguồn lưu trữ chính:
 * - Server nạp rows từ DB → build DocsIndex → `setDocsData()`.
 * - Test nạp fixture qua `setDocsData()`.
 * JSON chỉ còn là artifact trung gian cho seeder (pnpm db:seed-docs).
 */
import type { DocsIndex, DocFile, DocSection, IndexEntry } from "./types.js";

let index: DocsIndex | null = null;
let viIndex: DocsIndex | null = null;
let enDocFiles: DocFile[] = [];
let viDocFiles: DocFile[] = [];

/** Nạp data EN + VI (thay cho static import). Gọi trước khi dùng API search. */
export function setDocsData(en: { index: DocsIndex; files?: DocFile[] }, vi: { index: DocsIndex; files?: DocFile[] }): void {
  index = en.index;
  enDocFiles = en.files ?? [];
  viIndex = vi.index;
  viDocFiles = vi.files ?? [];
}

/** Build keywordIndex (keyword → entry ids) từ entries — dùng khi nạp từ DB.
 *  Dùng null-prototype để keyword như "constructor"/"toString" không dính prototype chain. */
export function buildKeywordIndex(entries: IndexEntry[]): Record<string, string[]> {
  const kw: Record<string, string[]> = Object.create(null);
  for (const e of entries) {
    for (const k of e.keywords) {
      if (!Object.prototype.hasOwnProperty.call(kw, k)) kw[k] = [];
      kw[k].push(e.id);
    }
  }
  return kw;
}

// Lazy cache cho DocFile theo category/sourceFile
let docFilesCache: Map<string, DocFile> | null = null;

function buildDocFileMap(files: DocFile[]): Map<string, DocFile> {
  const map = new Map<string, DocFile>();
  for (const doc of files) {
    map.set(doc.sourceFile, doc);
    map.set(doc.category, doc);
    map.set(doc.sourceFile.replace(".md", ""), doc);
    map.set(doc.sourceFile.replace(".md", ".json"), doc);
  }
  return map;
}

function loadDocFiles(): Map<string, DocFile> {
  if (docFilesCache) return docFilesCache;
  docFilesCache = buildDocFileMap(enDocFiles);
  return docFilesCache;
}

function getDocFilesSync(): Map<string, DocFile> {
  return buildDocFileMap(enDocFiles);
}

// Lazy cache cho DocFile tiếng Việt
let viDocFilesCache: Map<string, DocFile> | null = null;

function loadViDocFiles(): Map<string, DocFile> {
  if (viDocFilesCache) return viDocFilesCache;
  viDocFilesCache = buildDocFileMap(viDocFiles);
  return viDocFilesCache;
}

function getViDocFilesSync(): Map<string, DocFile> {
  return buildDocFileMap(viDocFiles);
}

function requireIndex(): DocsIndex {
  if (!index) throw new Error("Docs data EN chưa nạp — gọi setDocsData() trước (server: boot, test: fixture)");
  return index;
}

function requireViIndex(): DocsIndex {
  if (!viIndex) throw new Error("Docs data VI chưa nạp — gọi setDocsData() trước (server: boot, test: fixture)");
  return viIndex;
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

function searchIn(idx: DocsIndex, query: string, opts: SearchOptions): IndexEntry[] {
  const { limit = 20, category, keyword, exactTitle, caseSensitive } = opts;
  const qNorm = normalize(query, caseSensitive);
  if (!qNorm && !category && !keyword) return [];

  const tokens = qNorm ? qNorm.split(" ").filter(Boolean) : [];

  let pool: IndexEntry[] = idx.entries;

  // Lọc theo category nếu chỉ định
  if (category) {
    const catLower = category.toLowerCase();
    pool = pool.filter((e) => e.category.toLowerCase() === catLower);
  }

  // Lọc theo keyword nếu chỉ định
  if (keyword) {
    const kwLower = keyword.toLowerCase();
    const ids = Object.prototype.hasOwnProperty.call(idx.keywordIndex, kwLower) ? idx.keywordIndex[kwLower] : [];
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
  return pool
    .map((e) => ({ e, score: scoreEntry(e, tokens) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.e.title.localeCompare(b.e.title))
    .map((x) => x.e)
    .slice(0, limit);
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
  return searchIn(requireIndex(), query, opts);
}

function suggestIn(idx: DocsIndex, prefix: string, limit: number): IndexEntry[] {
  const p = normalize(prefix);
  if (!p) return [];
  const pool = idx.entries;
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
 * Gợi ý lệnh/autocomplete dựa trên prefix của title hoặc keyword.
 * Dùng cho dịch vụ nhắc lệnh (prompt suggestion).
 */
export function suggestCommands(prefix: string, limit = 10): IndexEntry[] {
  return suggestIn(requireIndex(), prefix, limit);
}

/**
 * Lấy entry theo id chính xác
 */
export function getById(id: string): IndexEntry | undefined {
  const lower = id.toLowerCase();
  return requireIndex().entries.find((e) => e.id.toLowerCase() === lower);
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
  return Object.keys(requireIndex().keywordIndex).sort();
}
/**
 * Lấy danh sách categories
 */
export function getCategories(): string[] {
  return [...requireIndex().categories];
}

/**
 * Lấy toàn bộ index (read-only)
 */
export function getIndex(): DocsIndex {
  return requireIndex();
}

function findDocFile(map: Map<string, DocFile>, categoryOrFile: string): DocFile | undefined {
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
 * Lấy DocFile đầy đủ (bao gồm sections + examples + tables) theo category hoặc file name.
 * Không còn await (data đã nạp sẵn) — giữ async để không vỡ consumer cũ.
 */
export async function getDocFile(categoryOrFile: string): Promise<DocFile | undefined> {
  return findDocFile(loadDocFiles(), categoryOrFile);
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
  return findDocFile(getDocFilesSync(), categoryOrFile);
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
  return [...enDocFiles];
}

/**
 * Alias giữ tương thích với API cũ `getDoc(topic)`
 * Trả về IndexEntry đầu tiên khớp title
 */
export function getDoc(topic: string): IndexEntry | undefined {
  return searchDocs(topic, { limit: 1, exactTitle: false })[0] ?? getById(topic);
}

// ---------------------------------------------------------------------------
// Tiếng Việt — cùng bộ API như EN nhưng đọc từ data VI đã nạp
// ---------------------------------------------------------------------------

/**
 * Tìm kiếm toàn văn trên index tiếng Việt.
 * Tương tự `searchDocs()` nhưng dùng dữ liệu tiếng Việt.
 */
export function searchDocsVi(query: string, opts: SearchOptions = {}): IndexEntry[] {
  return searchIn(requireViIndex(), query, opts);
}

/** Gợi ý lệnh/autocomplete trên dữ liệu tiếng Việt */
export function suggestCommandsVi(prefix: string, limit = 10): IndexEntry[] {
  return suggestIn(requireViIndex(), prefix, limit);
}

/** Lấy entry tiếng Việt theo id chính xác */
export function getByIdVi(id: string): IndexEntry | undefined {
  const lower = id.toLowerCase();
  return requireViIndex().entries.find((e) => e.id.toLowerCase() === lower);
}

/** Lấy tất cả entry tiếng Việt thuộc 1 category */
export function getByCategoryVi(category: string): IndexEntry[] {
  return searchDocsVi("", { category, limit: 1000 });
}

/** Lấy tất cả entry tiếng Việt chứa keyword */
export function getByKeywordVi(keyword: string): IndexEntry[] {
  return searchDocsVi("", { keyword, limit: 1000 });
}

/** Lấy danh sách keywords tiếng Việt duy nhất (sorted) */
export function getAllKeywordsVi(): string[] {
  return Object.keys(requireViIndex().keywordIndex).sort();
}

/** Lấy danh sách categories tiếng Việt */
export function getCategoriesVi(): string[] {
  return [...requireViIndex().categories];
}

/** Lấy toàn bộ index tiếng Việt (read-only) */
export function getIndexVi(): DocsIndex {
  return requireViIndex();
}

/** Lấy DocFile tiếng Việt đầy đủ (category hoặc file name) */
export async function getDocFileVi(categoryOrFile: string): Promise<DocFile | undefined> {
  return findDocFile(loadViDocFiles(), categoryOrFile);
}

/** Lấy 1 section tiếng Việt chi tiết theo id */
export async function getSectionByIdVi(id: string): Promise<DocSection | undefined> {
  const entry = getByIdVi(id);
  if (!entry) return undefined;
  const doc = await getDocFileVi(entry.sourceFile);
  if (!doc) return undefined;
  return doc.sections.find((s) => s.id.toLowerCase() === id.toLowerCase());
}

/** Đồng bộ: DocFile tiếng Việt ngay lập tức */
export function getDocFileSyncVi(categoryOrFile: string): DocFile | undefined {
  return findDocFile(getViDocFilesSync(), categoryOrFile);
}

/** Đồng bộ: section tiếng Việt theo id */
export function getSectionByIdSyncVi(id: string): DocSection | undefined {
  const entry = getByIdVi(id);
  if (!entry) return undefined;
  const doc = getDocFileSyncVi(entry.sourceFile);
  if (!doc) return undefined;
  return doc.sections.find((s) => s.id.toLowerCase() === id.toLowerCase());
}

/** Lấy toàn bộ DocFile tiếng Việt (static, sync) */
export function getAllDocFilesVi(): DocFile[] {
  return [...viDocFiles];
}

/** Alias tương thích `getDoc(topic)` cho tiếng Việt */
export function getDocVi(topic: string): IndexEntry | undefined {
  return searchDocsVi(topic, { limit: 1, exactTitle: false })[0] ?? getByIdVi(topic);
}
