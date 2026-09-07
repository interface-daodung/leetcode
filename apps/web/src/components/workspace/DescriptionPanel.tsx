import { useWorkspace } from "./WorkspaceContext.js";
import { sanitizeDescriptionHtml } from "../../lib/sanitize.js";
import { DifficultyBadge } from "../DifficultyBadge.js";

export function DescriptionPanel() {
  const { problem, showHints, setShowHints } = useWorkspace();

  if (!problem) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted">
        <p className="text-sm">Chọn đề bài từ Explorer để xem mô tả</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-5">
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="m-0 text-xl font-semibold text-text-primary">
            <span className="mr-2 font-mono text-sm text-text-muted">{problem.id}.</span>
            {problem.title}
          </h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        {problem.tags && problem.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {problem.tags.map((t) => (
              <span key={t} className="rounded-md border border-border bg-bg-elevated px-2 py-0.5 text-xs text-text-secondary">
                {t}
              </span>
            ))}
          </div>
        )}
        {problem.slug && (
          <a
            href={problem.url ?? `https://leetcode.com/problems/${problem.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-accent no-underline hover:underline"
          >
            leetcode.com/problems/{problem.slug} ↗
          </a>
        )}
      </div>

      <div className="rounded-xl border border-border bg-bg-elevated p-4">
        <div
          className="problem-description"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: sanitizeDescriptionHtml(problem.description ?? "") }}
        />
      </div>

      {problem.hints && problem.hints.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowHints(!showHints)}
            className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2 text-left text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover"
          >
            {showHints ? "▾" : "▸"} Gợi ý ({problem.hints.length})
          </button>
          {showHints && (
            <div className="mt-2 space-y-2">
              {problem.hints.map((h, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-accent-soft p-3 text-sm leading-relaxed text-text-primary"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: sanitizeDescriptionHtml(h) }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}