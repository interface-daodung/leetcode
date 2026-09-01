import { useMemo, useState, useEffect } from "react";
import {
  searchDocs,
  searchDocsVi,
  getCategories,
  getCategoriesVi,
  getSectionByIdSync,
  getSectionByIdSyncVi,
} from "@leetcode/javascript-docs";

type Lang = "en" | "vi";

const CATEGORIES_EN = getCategories();
const CATEGORIES_VI = getCategoriesVi();
// gộp danh sách category duy nhất (EN và VI giống nhau)
const ALL_CATEGORIES = Array.from(new Set([...CATEGORIES_EN, ...CATEGORIES_VI])).sort();

export function KnowledgePanel() {
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

  const selectedSection = useMemo(() => {
    if (!selectedId) return null;
    return lang === "vi" ? getSectionByIdSyncVi(selectedId) : getSectionByIdSync(selectedId);
  }, [selectedId, lang]);

  // đổi lang/category thì reset selection để tránh lệch dữ liệu
  useEffect(() => {
    setSelectedId(null);
  }, [lang, category]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-sidebar-bg">
      {/* Header: search + lang + category filters */}
      <div className="shrink-0 border-b border-border p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
              ⌕
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === "vi" ? "Tìm kiến thức: array map, closure, regex..." : "Search: array map, closure, regex..."}
              className="w-full rounded-lg border border-border bg-bg-elevated py-2 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-xs text-text-muted hover:bg-bg-hover hover:text-text-primary"
                aria-label="Xoá"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex shrink-0 overflow-hidden rounded-lg border border-border text-xs">
            <button
              type="button"
              onClick={() => setLang("vi")}
              className={`px-2.5 py-2 font-medium transition-colors ${lang === "vi" ? "bg-accent text-white" : "bg-bg-elevated text-text-secondary hover:bg-bg-hover"}`}
            >
              VI
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2.5 py-2 font-medium transition-colors ${lang === "en" ? "bg-accent text-white" : "bg-bg-elevated text-text-secondary hover:bg-bg-hover"}`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${category === null ? "bg-accent text-white" : "bg-bg-elevated text-text-secondary hover:bg-bg-hover border border-border"}`}
          >
            Tất cả
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${category === cat ? "bg-accent text-white" : "bg-bg-elevated text-text-secondary hover:bg-bg-hover border border-border"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-text-muted">
          {results.length > 0 ? `${results.length} kết quả` : debounced || category ? "Không tìm thấy kết quả" : "Nhập từ khoá hoặc chọn category để lọc"}
          {" · "}
          <span className="text-text-muted">JSON: tmp_reference{lang === "vi" ? "_vi" : ""} → data/{lang}/</span>
        </p>
      </div>

      {/* List + Detail */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Results */}
        <div className={`overflow-y-auto ${selectedSection ? "max-h-[45%] shrink-0 border-b border-border" : "flex-1"}`}>
          {results.length === 0 ? (
            <div className="p-6 text-center text-sm text-text-muted">
              {debounced || category ? (
                <p>Không có mục nào khớp. Thử từ khoá khác hoặc đổi EN/VI.</p>
              ) : (
                <div className="space-y-2">
                  <p>Gợi ý thử:</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {["array map", "string split", "closure", "regex", "object destructure"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQuery(s)}
                        className="rounded-full border border-border bg-bg-elevated px-2.5 py-1 text-xs text-text-secondary hover:bg-bg-hover"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ul className="py-1">
              {results.map((entry) => {
                const active = selectedId === entry.id;
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(entry.id)}
                      className={`block w-full px-3 py-2.5 text-left transition-colors ${active ? "bg-accent-soft" : "hover:bg-bg-hover"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-text-primary">{entry.title}</span>
                        <span className="shrink-0 rounded bg-bg-hover px-1.5 py-0.5 text-[10px] text-text-muted">{entry.category}</span>
                      </div>
                      {entry.summary && <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{entry.summary}</p>}
                      {entry.syntax && (
                        <code className="mt-1 block truncate rounded bg-bg-elevated px-1.5 py-0.5 text-[11px] text-text-secondary">{entry.syntax}</code>
                      )}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {entry.keywords.slice(0, 4).map((k) => (
                          <span key={k} className="rounded bg-bg-hover px-1 py-0.5 text-[10px] text-text-muted">
                            {k}
                          </span>
                        ))}
                        {entry.mdnUrl && <span className="rounded bg-accent-soft px-1 py-0.5 text-[10px] text-accent">MDN</span>}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Detail */}
        {selectedSection ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-bg-elevated">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
              <span className="truncate text-sm font-semibold text-text-primary">{selectedSection.title}</span>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded p-1 text-sm text-text-muted hover:bg-bg-hover hover:text-text-primary"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <span className="rounded bg-bg-hover px-2 py-0.5 text-xs text-text-muted">{selectedSection.category}</span>
                {selectedSection.mdnUrl && (
                  <a href={selectedSection.mdnUrl} target="_blank" rel="noreferrer" className="rounded bg-accent px-2 py-0.5 text-xs text-white no-underline hover:opacity-90">
                    MDN ↗
                  </a>
                )}
                {selectedSection.mutates !== null && (
                  <span className={`rounded px-2 py-0.5 text-xs ${selectedSection.mutates ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {selectedSection.mutates ? "mutates" : "pure"}
                  </span>
                )}
                {selectedSection.syntax && <span className="rounded border border-border bg-sidebar-bg px-2 py-0.5 font-mono text-xs text-text-secondary">{selectedSection.syntax}</span>}
              </div>
              {/* Nội dung chính: HTML đã phaser từ markdown — bảng + code có màu */}
              {selectedSection.contentHtml ? (
                <div className="knowledge-markdown" dangerouslySetInnerHTML={{ __html: selectedSection.contentHtml }} />
              ) : (
                <div className="knowledge-markdown">
                  <p className="text-sm text-text-secondary">{selectedSection.summary}</p>
                  {selectedSection.content && <pre className="whitespace-pre-wrap text-xs">{selectedSection.content.slice(0, 4000)}</pre>}
                </div>
              )}
              {/* Nội dung thô — text markdown nguyên (không cắt như trước) */}
              {selectedSection.content && (
                <details className="mt-3 rounded-lg border border-border bg-sidebar-bg p-2">
                  <summary className="cursor-pointer text-xs font-medium text-text-primary">Nội dung thô (markdown nguyên)</summary>
                  <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-text-secondary">{selectedSection.content}</pre>
                </details>
              )}
              <p className="mt-3 text-[11px] text-text-muted">
                {selectedSection.sourceFile}#{selectedSection.anchor} · id: {selectedSection.id}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
