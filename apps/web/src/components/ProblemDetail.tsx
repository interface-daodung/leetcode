import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { ProblemMeta } from "@leetcode/shared";
import { fetchProblem, runCode } from "../lib/api.js";
import { sanitizeDescriptionHtml } from "../lib/sanitize.js";
import { DifficultyBadge } from "./DifficultyBadge.js";
import { CodeEditor } from "./CodeEditor.js";

export function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<ProblemMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      setLoading(false);
      return;
    }
    void fetchProblem(numericId).then((p) => {
      setProblem(p);
      setCode(p?.template ?? "");
      setOutput("");
      setLoading(false);
    });
  }, [id]);

  const handleRun = useCallback(async () => {
    if (!problem) return;
    setRunning(true);
    setOutput("Đang chạy...");
    const result = await runCode(problem.id, code);
    if (result.error) {
      setOutput(`Lỗi: ${result.error}`);
    } else {
      setOutput(`Kết quả: ${result.passed} / ${result.total} test case đúng`);
    }
    setRunning(false);
  }, [problem, code]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-sm">Đang tải đề bài...</span>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-text-muted">
        <p className="text-lg">Không tìm thấy đề bài</p>
        <button
          type="button"
          onClick={() => navigate("/problems", { replace: true })}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Xem danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Cột trái: Description + Hints */}
      <div className="flex-1 overflow-y-auto border-r border-border p-4 md:p-5">
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
              onClick={() => setShowHints((o) => !o)}
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

      {/* Cột phải: Code Editor */}
      <div className="flex w-full flex-col overflow-y-auto md:w-1/2">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="m-0 text-sm font-semibold text-text-primary">Code</h2>
            <span className="rounded bg-bg-hover px-2 py-0.5 text-xs text-text-muted">JavaScript</span>
          </div>
          <div className="flex items-center gap-3">
            {output && (
              <span
                className={`text-xs ${
                  output.startsWith("Kết quả") ? "text-success" : output.startsWith("Lỗi") ? "text-danger" : "text-text-secondary"
                }`}
              >
                {output}
              </span>
            )}
            <button
              type="button"
              onClick={handleRun}
              disabled={running}
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-50"
            >
              {running ? "Đang chạy..." : "▶ Run"}
            </button>
          </div>
        </div>
        <div className="flex-1 p-3">
          <CodeEditor
            value={code}
            onChange={setCode}
            language="javascript"
            placeholder="// Viết code giải tại đây"
          />
        </div>
      </div>
    </div>
  );
}