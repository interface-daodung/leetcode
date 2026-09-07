import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { API_BASE } from "../../lib/api";
import type { IndexEntry, DocSection } from "@leetcode/javascript-docs";

type Lang = "en" | "vi";

// Categories EN+VI giống nhau (server trả từ DB) — hard list cho chips filter khi chưa fetch
export const KNOWLEDGE_CATEGORIES: string[] = [
  "array", "cheatsheet", "conditional", "fcc", "function", "loop", "notes",
  "number-date", "object", "practical", "react", "regex", "string",
];

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
  /** Kết quả tìm kiếm đã debounce + filter theo lang/category (fetch từ server) */
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
  const [results, setResults] = useState<IndexEntry[]>([]);

  // debounce 180ms
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), 180);
    return () => window.clearTimeout(t);
  }, [query]);

  // search qua server API (data nằm trong SQLite, server build index khi boot)
  useEffect(() => {
    const q = debounced.trim();
    if (!q && !category) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const params = new URLSearchParams({ q, lang, limit: "30" });
    if (category) params.set("category", category);
    fetch(`${API_BASE}/api/docs/search?${params}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: unknown) => setResults(Array.isArray(data) ? (data as IndexEntry[]) : []))
      .catch(() => {
        // abort hoặc lỗi mạng — giữ nguyên kết quả cũ
      });
    return () => controller.abort();
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

/** Resolve section theo lang hiện tại (fetch server — dùng chung cho panel Result). */
export function useSelectedSection(): DocSection | null {
  const { selectedId, lang } = useKnowledgeState();
  const [section, setSection] = useState<DocSection | null>(null);

  useEffect(() => {
    if (!selectedId) {
      setSection(null);
      return;
    }
    const controller = new AbortController();
    fetch(`${API_BASE}/api/docs/section/${encodeURIComponent(selectedId)}?lang=${lang}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: DocSection | null) => setSection(data))
      .catch(() => {});
    return () => controller.abort();
  }, [selectedId, lang]);

  return section;
}
