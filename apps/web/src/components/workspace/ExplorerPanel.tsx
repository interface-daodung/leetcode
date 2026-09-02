import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { ProblemMeta } from "@leetcode/shared";
import { fetchProblems, diagnoseConnection } from "../../lib/api.js";
import { useErrorStore } from "./ErrorContext.js";
import { DifficultyBadge } from "../DifficultyBadge.js";

type Filter = "all" | "easy" | "medium" | "hard";

export function ExplorerPanel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pushError } = useErrorStore();
  const [problems, setProblems] = useState<ProblemMeta[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let cancelled = false;
    fetchProblems()
      .then((data) => {
        if (!cancelled) setProblems(data);
      })
      .catch(async (e) => {
        if (cancelled) return;
        const detail = e instanceof Error ? e.message : String(e);
        const diag = await diagnoseConnection().catch(() => null);
        const diagLine = diag ? ` | Chuẩn đoán: ${diag.detail}` : "";
        pushError({ source: "fetch", message: "Không tải được danh sách đề bài (GET /api/problems)", detail: `${detail}${diagLine}` });
      });
    return () => {
      cancelled = true;
    };
  }, [pushError]);

  const counts = useMemo(() => {
    const c = { all: problems.length, easy: 0, medium: 0, hard: 0 };
    for (const p of problems) {
      if (p.difficulty === "easy" || p.difficulty === "medium" || p.difficulty === "hard") {
        c[p.difficulty]++;
      }
    }
    return c;
  }, [problems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems
      .filter((p) => filter === "all" || p.difficulty === filter)
      .filter(
        (p) =>
          !q ||
          p.title.toLowerCase().includes(q) ||
          String(p.id).includes(q) ||
          (p.slug ?? "").toLowerCase().includes(q),
      )
      .sort((a, b) => a.id - b.id);
  }, [problems, query, filter]);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "easy", label: "Easy" },
    { key: "medium", label: "Medium" },
    { key: "hard", label: "Hard" },
  ];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-sidebar-bg">
      <div className="border-b border-border p-3">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
            ⌕
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm đề bài..."
            className="w-full rounded-lg border border-border bg-bg-elevated py-2 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div className="mt-2 flex gap-1">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                filter === f.key ? "bg-accent text-white" : "text-text-secondary hover:bg-bg-hover"
              }`}
            >
              {f.label}
              <span className="ml-1 opacity-70">{counts[f.key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="p-4 text-center text-sm text-text-muted">
            {problems.length === 0 ? "Chưa có đề bài nào" : "Không tìm thấy kết quả"}
          </p>
        ) : (
          <ul className="py-2">
            {filtered.map((p) => {
              const active = String(p.id) === id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/problems/${p.id}`)}
                    className={`block w-full px-3 py-2 text-left no-underline transition-colors ${
                      active ? "bg-accent-soft" : "hover:bg-bg-hover"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-text-primary">
                        <span className="mr-1.5 font-mono text-xs text-text-muted">{p.id}.</span>
                        {p.title}
                      </span>
                      <DifficultyBadge difficulty={p.difficulty} />
                    </div>
                    {p.tags && p.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {p.tags.slice(0, 3).map((t) => (
                          <span key={t} className="rounded bg-bg-hover px-1.5 py-0.5 text-[10px] text-text-muted">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}