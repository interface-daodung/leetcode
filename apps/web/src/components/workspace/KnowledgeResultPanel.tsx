import { useKnowledgeState, useSelectedSection } from "./KnowledgeContext.js";

export function KnowledgeResultPanel() {
  const { selectedId, selectSection } = useKnowledgeState();
  const selectedSection = useSelectedSection();

  if (!selectedId || !selectedSection) {
    return (
      <div className="flex h-full items-center justify-center bg-bg-elevated p-6 text-center">
        <p className="text-sm text-text-muted">
          Chọn một kết quả trong <span className="font-medium text-text-secondary">Knowledge Search</span> để xem chi tiết ở đây
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-bg-elevated">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <span className="truncate text-sm font-semibold text-text-primary">{selectedSection.title}</span>
        <button
          type="button"
          onClick={() => selectSection(null)}
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
        <p className="mt-3 flex flex-wrap items-center gap-1 text-[11px] text-text-muted">
          <a
            href={`/doc/${selectedSection.sourceFile.replace(/\.md$/i, "")}${selectedSection.anchor ?? ""}`}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-accent hover:decoration-solid"
            title={`Mở ${selectedSection.sourceFile} trong trang doc riêng`}
          >
            {selectedSection.sourceFile}
            {selectedSection.anchor}
          </a>
          <span>· id: {selectedSection.id}</span>
        </p>
      </div>
    </div>
  );
}
