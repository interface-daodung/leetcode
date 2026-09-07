import { useState } from "react";
import { useErrorStore } from "./ErrorContext.js";
import type { ErrorSource } from "./ErrorContext.js";

const SOURCE_LABEL: Record<ErrorSource, string> = {
  ws: "WebSocket",
  ai: "AI",
  code: "Code",
  render: "Render",
  fetch: "Fetch",
  other: "Other",
};

function fmtTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function ErrorPanel() {
  const { errors, removeError, clearErrors } = useErrorStore();
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-bg-elevated px-3 py-2">
        <span className="text-sm font-semibold text-text-primary">
          Lỗi {errors.length > 0 && <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-[11px] text-red-700 dark:bg-red-900/40 dark:text-red-300">{errors.length}</span>}
        </span>
        <button
          type="button"
          onClick={clearErrors}
          disabled={errors.length === 0}
          className="rounded px-2 py-1 text-xs text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-30"
        >
          Xoá tất cả
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-2">
        {errors.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-text-muted">Chưa có lỗi nào. Khi server/AI/WebSocket báo lỗi, sẽ hiện ở đây.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {errors.map((e) => {
              const isOpen = expanded[e.id] ?? false;
              return (
                <li key={e.id} className="rounded-lg border border-red-300 bg-red-50 p-2 dark:border-red-700 dark:bg-red-900/20">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-red-700 dark:text-red-300">
                        <span className="rounded bg-red-200 px-1.5 py-0.5 font-medium dark:bg-red-800">{SOURCE_LABEL[e.source]}</span>
                        <span className="text-text-muted">{fmtTime(e.ts)}</span>
                      </div>
                      <p className="mt-1 break-words text-sm text-text-primary">{e.message}</p>
                      {e.detail && (
                        <button
                          type="button"
                          onClick={() => setExpanded((m) => ({ ...m, [e.id]: !isOpen }))}
                          className="mt-1 text-[11px] text-accent hover:underline"
                        >
                          {isOpen ? "Ẩn chi tiết" : "Hiện chi tiết"}
                        </button>
                      )}
                      {isOpen && e.detail && (
                        <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded bg-sidebar-bg p-2 text-[11px] text-text-secondary">{e.detail}</pre>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeError(e.id)}
                      className="shrink-0 rounded px-1.5 py-0.5 text-xs text-text-muted hover:bg-bg-hover hover:text-text-primary"
                      aria-label="Xoá"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
