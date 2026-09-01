import { useKnowledgeState } from "./KnowledgeContext.js";
import { useWorkspace } from "./WorkspaceContext.js";

export function KnowledgeSearchPanel() {
  const { query, setQuery, lang, setLang, category, setCategory, results, debounced, categories, selectSection } = useKnowledgeState();
  const { focusPanelTab } = useWorkspace();

  const openResult = (id: string) => {
    selectSection(id);
    // Mở/focus tab Knowledge Result để hiển thị chi tiết
    focusPanelTab("knowledge-result");
  };

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
          {categories.map((cat) => (
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
          {results.length > 0 ? `${results.length} kết quả — bấm để mở trong Knowledge Result` : debounced || category ? "Không tìm thấy kết quả" : "Nhập từ khoá hoặc chọn category để lọc"}
        </p>
      </div>

      {/* Results — bấm kết quả → mở trong panel Knowledge Result */}
      <div className="flex-1 overflow-y-auto">
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
            {results.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => openResult(entry.id)}
                  className="block w-full px-3 py-2.5 text-left transition-colors hover:bg-bg-hover"
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
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
