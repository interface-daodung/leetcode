import type { ProblemMeta } from "@leetcode/shared";

export interface TestCaseResultView {
  input: unknown;
  expected: unknown;
  actual: unknown;
  ok: boolean;
  error?: string;
}

export const API_BASE: string =
  (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL ?? "http://localhost:3000";

/** Chuẩn đoán nhanh kết nối server — gọi GET /health, trả về thông tin để log/gỡ lỗi. */
export interface ConnectionDiag {
  apiBase: string;
  healthUrl: string;
  ok: boolean;
  status?: number;
  statusText?: string;
  latencyMs?: number;
  /** Loại lỗi: 'connection-refused' | 'timeout' | 'cors' | 'http' | 'unknown' */
  errorKind: string;
  detail: string;
}

export async function diagnoseConnection(timeoutMs = 3000): Promise<ConnectionDiag> {
  const healthUrl = `${API_BASE}/health`;
  const started = Date.now();
  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(healthUrl, { signal: controller.signal, cache: "no-store" });
    globalThis.clearTimeout(timer);
    const latency = Date.now() - started;
    if (res.ok) {
      return { apiBase: API_BASE, healthUrl, ok: true, status: res.status, statusText: res.statusText, latencyMs: latency, errorKind: "", detail: `Server phản hồi ${res.status} trong ${latency}ms` };
    }
    return { apiBase: API_BASE, healthUrl, ok: false, status: res.status, statusText: res.statusText, errorKind: "http", detail: `Server trả ${res.status} ${res.statusText} (sau ${latency}ms)` };
  } catch (e) {
    globalThis.clearTimeout(timer);
    const err = e as Error;
    const msg = err.message ?? String(e);
    let kind = "unknown";
    if (err.name === "AbortError") kind = "timeout";
    else if (/Failed to fetch|NetworkError|fetch failed/i.test(msg)) kind = "connection-refused";
    else if (/CORS|Access-Control-Allow-Origin/i.test(msg)) kind = "cors";
    return {
      apiBase: API_BASE,
      healthUrl,
      ok: false,
      errorKind: kind,
      detail: `${msg} (sau ${Date.now() - started}ms) — kiểm tra: server có chạy không, PORT/VITE_API_URL có khớp không, CORS có mở không`,
    };
  }
}

export async function fetchProblems(): Promise<ProblemMeta[]> {
  const res = await fetch(`${API_BASE}/api/problems`);
  if (!res.ok) return [];
  const data = (await res.json()) as ProblemMeta[];
  return Array.isArray(data) ? data : [];
}

export async function fetchProblem(id: number): Promise<ProblemMeta | null> {
  const res = await fetch(`${API_BASE}/api/problems/${id}`);
  if (!res.ok) return null;
  return (await res.json()) as ProblemMeta;
}

export async function runCode(
  id: number,
  code: string,
): Promise<{ passed?: number; total?: number; error?: string; results?: TestCaseResultView[] }> {
  try {
    const res = await fetch(`${API_BASE}/api/problems/${id}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = (await res.json()) as {
      passed?: number;
      total?: number;
      error?: string;
      results?: TestCaseResultView[];
    };
    return data;
  } catch (e) {
    return { error: String(e) };
  }
}

export interface PlaygroundOpenResult {
  path: string;
  line: number;
  column: number;
  file: string;
}

export async function saveToPlayground(
  slug: string,
  code: string,
): Promise<{ ok: true; result: PlaygroundOpenResult } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/playground/${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = (await res.json()) as PlaygroundOpenResult & { error?: string };
    if (!res.ok) return { ok: false, error: data.error ?? `Lỗi ${res.status}` };
    return { ok: true, result: data };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}