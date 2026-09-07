import { useState } from "react";
import type { TestCaseResultView } from "../lib/api.js";

function formatValue(v: unknown): string {
  if (v === undefined) return "undefined";
  if (v === null) return "null";
  if (typeof v === "string") return JSON.stringify(v);
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function ValueBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-text-muted">{label}</div>
      <pre className="m-0 overflow-x-auto rounded-lg border border-border bg-code-bg p-2 font-mono text-xs leading-relaxed text-text-primary">
        {formatValue(value)}
      </pre>
    </div>
  );
}

interface TestCaseTabsProps {
  results: TestCaseResultView[];
  passed: number;
  total: number;
}

export function TestCaseTabs({ results, passed, total }: TestCaseTabsProps) {
  const [active, setActive] = useState(0);
  if (results.length === 0) return null;
  const idx = Math.min(active, results.length - 1);
  const current = results[idx];

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-bg-elevated">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
        <span
          className={`mr-2 text-xs font-semibold ${passed === total ? "text-success" : "text-danger"}`}
        >
          {passed}/{total} đúng
        </span>
        {results.map((r, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              i === idx
                ? "bg-accent-soft text-text-primary"
                : "text-text-secondary hover:bg-bg-hover"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${r.ok ? "bg-success" : "bg-danger"}`} />
            Case {i + 1}
          </button>
        ))}
      </div>

      <div className="grid gap-3 p-3 sm:grid-cols-3">
        <ValueBlock label="Input" value={current.input} />
        <ValueBlock label="Kỳ vọng (Expected)" value={current.expected} />
        <ValueBlock label="Kết quả (Actual)" value={current.actual ?? current.error} />
      </div>

      {current.error && (
        <div className="mx-3 mb-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          Lỗi chạy: {current.error}
        </div>
      )}
    </div>
  );
}