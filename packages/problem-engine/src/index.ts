import { problemDb } from "@leetcode/database";
import type { ProblemMeta, Difficulty, TestCase } from "@leetcode/shared";
import {
  createProblemTreeState,
  registerProblem,
  removeProblem,
  findProblem,
  listByDifficulty,
  searchProblems,
  getTags,
  hydrateProblems,
} from "./problemTree.js";
import type { ProblemTreeState, ProblemSearchParams } from "./problemTree.js";

export interface Problem extends ProblemMeta {
  description: string;
  testCases: TestCase[];
}

export class ProblemEngine {
  private problems: Map<number, Problem> = new Map();
  private tree: ProblemTreeState = createProblemTreeState();

  register(problem: Problem): void {
    // Giữ map phẳng để chạy test + tra cứu nhanh
    this.problems.set(problem.id, problem);
    // Đồng bộ vào tree model (theo difficulty + tags)
    this.tree = registerProblem(this.tree, problem);
    void problemDb.add(problem);
  }

  get(id: number): Problem | undefined {
    return this.problems.get(id);
  }

  getRandom(difficulty?: Difficulty): Problem | undefined {
    const candidates = difficulty
      ? this.tree.byDifficulty[difficulty].map((n) => this.problems.get(n.id)).filter(Boolean) as Problem[]
      : Array.from(this.problems.values());
    if (candidates.length === 0) return undefined;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  runTests(problemId: number, solution: (input: unknown) => unknown): { passed: number; total: number } {
    const problem = this.problems.get(problemId);
    if (!problem) return { passed: 0, total: 0 };

    let passed = 0;
    for (const tc of problem.testCases) {
      try {
        const result = solution(tc.input);
        if (JSON.stringify(result) === JSON.stringify(tc.expected)) {
          passed++;
        }
      } catch {
      }
    }
    return { passed, total: problem.testCases.length };
  }

  /** Chạy từng test case, trả về kết quả chi tiết (input/expected/actual/error) để hiển thị trên UI. */
  runTestsDetailed(
    problemId: number,
    solution: (input: unknown) => unknown,
  ): { passed: number; total: number; results: TestCaseResult[] } {
    const problem = this.problems.get(problemId);
    if (!problem) return { passed: 0, total: 0, results: [] };

    const results: TestCaseResult[] = [];
    let passed = 0;
    for (const tc of problem.testCases) {
      try {
        const actual = solution(tc.input);
        const ok = JSON.stringify(actual) === JSON.stringify(tc.expected);
        if (ok) passed++;
        results.push({ input: tc.input, expected: tc.expected, actual, ok, error: undefined });
      } catch (e) {
        results.push({ input: tc.input, expected: tc.expected, actual: undefined, ok: false, error: String(e) });
      }
    }
    return { passed, total: problem.testCases.length, results };
  }

  /** Xóa problem khỏi engine + tree. */
  remove(id: number): void {
    this.problems.delete(id);
    this.tree = removeProblem(this.tree, id);
  }

  /** Nạp danh sách problem vào engine (hydrate từ DB). */
  hydrate(problems: Problem[]): void {
    this.tree = hydrateProblems(this.tree, problems);
    for (const p of problems) {
      this.problems.set(p.id, p);
    }
  }

  // ---- Tree-aware API (state/tree model) ----

  /** Trả bản sao của tree state hiện tại. */
  getTree(): ProblemTreeState {
    return this.tree;
  }

  /** Tìm kiếm + lọc theo difficulty (dùng cho explorer/sidebar). */
  search(params: ProblemSearchParams = {}): ProblemMeta[] {
    return searchProblems(this.tree, params);
  }

  /** Danh sách tags đang có. */
  getTags(): string[] {
    return getTags(this.tree);
  }

  /** List problems theo difficulty. */
  listByDifficulty(difficulty?: Difficulty): ProblemMeta[] {
    return listByDifficulty(this.tree, difficulty);
  }

  /** Tra cứu meta qua tree. */
  findMeta(id: number): ProblemMeta | undefined {
    return findProblem(this.tree, id);
  }
}

export interface TestCaseResult {
  input: unknown;
  expected: unknown;
  actual: unknown;
  ok: boolean;
  error?: string;
}

export const engine = new ProblemEngine();

// Re-export tree model types để app dùng chung
export { createProblemTreeState, registerProblem, removeProblem, findProblem, listByDifficulty, searchProblems, getTags, hydrateProblems };
export type { ProblemTreeState, ProblemSearchParams };
