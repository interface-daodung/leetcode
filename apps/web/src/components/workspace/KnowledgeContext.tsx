import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  searchDocs,
  searchDocsVi,
  getCategories,
  getCategoriesVi,
  getSectionByIdSync,
  getSectionByIdSyncVi,
} from "@leetcode/javascript-docs";
import type { IndexEntry, DocSection } from "@leetcode/javascript-docs";

type Lang = "en" | "vi";

const CATEGORIES_EN = getCategories();
const CATEGORIES_VI = getCategoriesVi();
// gộp danh sách category duy nhất (EN và VI giống nhau)
export const KNOWLEDGE_CATEGORIES: string[] = Array.from(new Set([...CATEGORIES_EN, ...CATEGORIES_VI])).sort();

export interface KnowledgeState {
  /** Từ khoá đang gõ (chưa debounce) */
  query: string;
  setQuery: (q: string) => void;
  /** Từ khoá đã debounce 180ms — kết quả tìm kiếm tính theo giá trị này */
  debounced: string;
  category: string | null;
  setCategory: (c: string | null) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Section đang mở trong panel Result (null = chưa chọn) */
  selectedId: string | null;
  selectSection: (id: string | null) => void;
  /** Kết quả tìm kiếm đã debounce + filter theo lang/category */
  results: IndexEntry[];
  /** Danh sách category (EN+VI gộp) cho filter chips */
  categories: string[];
}

const KnowledgeCtx = createContext<KnowledgeState | null>(null);

export function KnowledgeProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("vi");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // debounce 180ms
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), 180);
    return () => window.clearTimeout(t);
  }, [query]);

  const results = useMemo(() => {
    const opts = { limit: 30, ...(category ? { category } : {}) };
    const q = debounced.trim();
    // Nếu không có query và không có category → không trả gì (tránh spam 287 entries)
    if (!q && !category) return [];
    if (lang === "vi") return searchDocsVi(q, opts);
    return searchDocs(q, opts);
  }, [debounced, category, lang]);

  // đổi lang/category thì reset selection để tránh lệch dữ liệu
  useEffect(() => {
    setSelectedId(null);
  }, [lang, category]);

  const value = useMemo<KnowledgeState>(
    () => ({
      query,
      setQuery,
      debounced,
      category,
      setCategory,
      lang,
      setLang,
      selectedId,
      selectSection: setSelectedId,
      results,
      categories: KNOWLEDGE_CATEGORIES,
    }),
    [query, debounced, category, lang, selectedId, results],
  );

  return <KnowledgeCtx.Provider value={value}>{children}</KnowledgeCtx.Provider>;
}

/** Hook nội bộ cho 2 panel Knowledge (phải nằm dưới KnowledgeProvider). */
export function useKnowledgeState(): KnowledgeState {
  const ctx = useContext(KnowledgeCtx);
  if (!ctx) {
    throw new Error("useKnowledgeState phải nằm dưới KnowledgeProvider");
  }
  return ctx;
}

/** Resolve section theo lang hiện tại (dùng chung cho panel Result). */
export function useSelectedSection(): DocSection | null {
  const { selectedId, lang } = useKnowledgeState();
  return useMemo(() => {
    if (!selectedId) return null;
    return (lang === "vi" ? getSectionByIdSyncVi(selectedId) : getSectionByIdSync(selectedId)) ?? null;
  }, [selectedId, lang]);
}
