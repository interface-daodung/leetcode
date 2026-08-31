import type { Difficulty, ProblemMeta } from "@leetcode/shared";

/**
 * ProblemTree — problems dưới dạng tree model (state + pure operations).
 *
 * Cây tổ chức problems theo difficulty (nhánh chính) và theo tags (phụ),
 * kèm index `byId` để tra cứu O(1). Mọi operation là pure: trả state mới.
 */

export interface ProblemNode {
  id: number;
  meta: ProblemMeta;
}

export interface ProblemTreeState {
  byDifficulty: Record<Difficulty, ProblemNode[]>;
  byTag: Map<string, ProblemNode[]>;
  byId: Map<number, ProblemNode>;
  total: number;
}

export function createProblemTreeState(): ProblemTreeState {
  return {
    byDifficulty: { easy: [], medium: [], hard: [] },
    byTag: new Map(),
    byId: new Map(),
    total: 0,
  };
}

export function registerProblem(state: ProblemTreeState, problem: ProblemMeta): ProblemTreeState {
  const existing = state.byId.get(problem.id);
  if (existing && existing.meta === problem) return state;

  const diff = problem.difficulty;
  const nextByDifficulty: Record<Difficulty, ProblemNode[]> = {
    ...state.byDifficulty,
    [diff]: [
      ...(existing ? state.byDifficulty[diff].filter((n) => n.id !== problem.id) : state.byDifficulty[diff]),
      { id: problem.id, meta: problem },
    ],
  };

  const nextByTag = new Map(state.byTag);
  for (const tag of problem.tags ?? []) {
    const list = nextByTag.get(tag) ?? [];
    nextByTag.set(tag, [...list.filter((n) => n.id !== problem.id), { id: problem.id, meta: problem }]);
  }

  const nextById = new Map(state.byId);
  nextById.set(problem.id, { id: problem.id, meta: problem });

  return {
    byDifficulty: nextByDifficulty,
    byTag: nextByTag,
    byId: nextById,
    total: existing ? state.total : state.total + 1,
  };
}

export function removeProblem(state: ProblemTreeState, id: number): ProblemTreeState {
  const node = state.byId.get(id);
  if (!node) return state;

  const byDifficulty: Record<Difficulty, ProblemNode[]> = {
    easy: state.byDifficulty.easy.filter((n) => n.id !== id),
    medium: state.byDifficulty.medium.filter((n) => n.id !== id),
    hard: state.byDifficulty.hard.filter((n) => n.id !== id),
  };

  const byTag = new Map<string, ProblemNode[]>();
  for (const [tag, list] of state.byTag) {
    const filtered = list.filter((n) => n.id !== id);
    if (filtered.length > 0) byTag.set(tag, filtered);
  }

  const byId = new Map(state.byId);
  byId.delete(id);

  return { byDifficulty, byTag, byId, total: state.total - 1 };
}

export function findProblem(state: ProblemTreeState, id: number): ProblemMeta | undefined {
  return state.byId.get(id)?.meta;
}

export function listByDifficulty(state: ProblemTreeState, difficulty?: Difficulty): ProblemMeta[] {
  if (!difficulty) return [...state.byId.values()].map((n) => n.meta);
  return state.byDifficulty[difficulty].map((n) => n.meta);
}

export function listByTag(state: ProblemTreeState, tag: string): ProblemMeta[] {
  return (state.byTag.get(tag) ?? []).map((n) => n.meta);
}

export interface ProblemSearchParams {
  query?: string;
  difficulty?: Difficulty;
}

/** Tìm kiếm + lọc theo difficulty. Query khớp title/id/slug. */
export function searchProblems(state: ProblemTreeState, params: ProblemSearchParams = {}): ProblemMeta[] {
  const q = (params.query ?? "").trim().toLowerCase();
  return listByDifficulty(state, params.difficulty)
    .filter((p) => {
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        (p.slug ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.id - b.id);
}

export function getTags(state: ProblemTreeState): string[] {
  return [...state.byTag.keys()].sort();
}

export function getDifficultyCounts(state: ProblemTreeState): Record<Difficulty, number> {
  return {
    easy: state.byDifficulty.easy.length,
    medium: state.byDifficulty.medium.length,
    hard: state.byDifficulty.hard.length,
  };
}

/** Nạp danh sách problems vào state (dùng cho hydrate từ DB). */
export function hydrateProblems(state: ProblemTreeState, problems: ProblemMeta[]): ProblemTreeState {
  let next = state;
  for (const p of problems) {
    next = registerProblem(next, p);
  }
  return next;
}
