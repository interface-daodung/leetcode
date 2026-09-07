import { useState } from "react";
import { useWorkspace } from "./WorkspaceContext.js";
import { useAI } from "./useAI.js";
import { buildChatGptUrl } from "@leetcode/ai";
import type { AIProblemInput } from "@leetcode/ai";

export function AIPanel() {
  const { problem } = useWorkspace();
  const { guide, error, loading, requestGuide, clear } = useAI();
  const [showJson, setShowJson] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const problemInput: AIProblemInput | null = problem
    ? {
        id: problem.id,
        title: problem.title,
        slug: problem.slug,
        url: problem.url,
        difficulty: problem.difficulty,
        tags: problem.tags ?? [],
        description: problem.description,
        template: problem.template,
        hints: problem.hints,
      }
    : null;

  const handleGenerate = () => {
    if (!problemInput) return;
    requestGuide(problemInput);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-bg-elevated px-3 py-2">
        <span className="text-sm font-semibold text-text-primary">AI Hướng dẫn giải</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowJson((v) => !v)}
            className="rounded px-2 py-1 text-xs text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            JSON
          </button>
          {guide && (
            <button
              type="button"
              onClick={clear}
              className="rounded px-2 py-1 text-xs text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3">
        {!problem && (
          <p className="text-sm text-text-muted">Chọn đề bài từ Explorer để AI sinh hướng dẫn giải.</p>
        )}

        {problem && !guide && !loading && !error && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-text-secondary">{problem.title}</p>
            <p className="text-sm text-text-muted">
              Bấm nút bên dưới để máy chủ (server, không lộ prompt) sinh hướng dẫn giải dạng JSON.
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Sinh hướng dẫn giải
            </button>
          </div>
        )}

        {loading && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-text-muted">Đang sinh hướng dẫn trên máy chủ...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        {guide && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-bg-elevated p-3">
              <div className="mb-1 flex items-center gap-2">
                <h1 className="m-0 text-sm font-semibold text-text-primary">
                  {guide.problemId}. {guide.title}
                </h1>
                <span className="rounded bg-bg-hover px-2 py-0.5 text-[11px] text-text-muted">{guide.difficulty}</span>
              </div>
              {guide.tags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {guide.tags.map((t) => (
                    <span key={t} className="rounded border border-border bg-sidebar-bg px-1.5 py-0.5 text-[11px] text-text-secondary">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {guide.url && (
                <button
                  type="button"
                  onClick={() => window.open(buildChatGptUrl(problemInput!), "_blank", "noopener")}
                  className="rounded bg-accent px-2 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  Hỏi ChatGPT về cả bài ↗
                </button>
              )}
            </div>

            {guide.sections.map((section) => {
              const isOpen = expanded[section.id] ?? false;
              return (
                <div key={section.id} className="rounded-xl border border-border bg-bg-elevated p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-text-primary">{section.title}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setExpanded((e) => ({ ...e, [section.id]: !isOpen }))}
                        className="rounded px-2 py-0.5 text-[11px] text-text-secondary transition-colors hover:bg-bg-hover"
                      >
                        {isOpen ? "Ẩn giải thích" : "Giải thích"} (AI)
                      </button>
                      {problemInput && (
                        <button
                          type="button"
                          onClick={() => window.open(buildChatGptUrl(problemInput), "_blank", "noopener")}
                          className="rounded bg-accent px-2 py-0.5 text-[11px] text-white transition-opacity hover:opacity-90"
                        >
                          ChatGPT ↗
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-text-secondary">{section.content}</p>
                  {isOpen && (
                    <div className="mt-2 rounded-lg border border-accent/30 bg-accent-soft p-2 text-sm text-text-primary">
                      <span className="mb-1 block text-[11px] font-medium text-accent">Giải thích chi tiết từng phần</span>
                      <p className="whitespace-pre-wrap">{section.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {showJson && (
              <details className="rounded-lg border border-border bg-sidebar-bg p-2">
                <summary className="cursor-pointer text-xs font-medium text-text-primary">JSON thô (khuôn mẫu hướng dẫn)</summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-text-secondary">
                  {JSON.stringify(guide, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}