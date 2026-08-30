import type { ProblemMeta } from "@leetcode/shared";

export const API_BASE: string =
  (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL ?? "http://localhost:3000";

export async function fetchProblems(): Promise<ProblemMeta[]> {
  const res = await fetch(`${API_BASE}/api/problems`);
  if (!res.ok) return [];
  const data = (await res.json()) as ProblemMeta[];
  return Array.isArray(data) ? data : [];
}

export async function fetchProblem(id: number): Promise<ProblemMeta | null> {
  try {
    const res = await fetch(`${API_BASE}/api/problems/${id}`);
    if (!res.ok) return null;
    return (await res.json()) as ProblemMeta;
  } catch {
    return null;
  }
}

export async function runCode(
  id: number,
  code: string,
): Promise<{ passed?: number; total?: number; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/problems/${id}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = (await res.json()) as { passed?: number; total?: number; error?: string };
    return data;
  } catch (e) {
    return { error: String(e) };
  }
}