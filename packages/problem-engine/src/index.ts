import { problemDb } from "@leetcode/database";
import type { ProblemMeta, Difficulty, TestCase } from "@leetcode/shared";

export interface Problem extends ProblemMeta {
  description: string;
  testCases: TestCase[];
  solution?: string;
}

export class ProblemEngine {
  private problems: Map<number, Problem> = new Map();

  register(problem: Problem): void {
    this.problems.set(problem.id, problem);
    void problemDb.add(problem);
  }

  get(id: number): Problem | undefined {
    return this.problems.get(id);
  }

  getRandom(difficulty?: Difficulty): Problem | undefined {
    const candidates = difficulty
      ? Array.from(this.problems.values()).filter((p) => p.difficulty === difficulty)
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
}

export const engine = new ProblemEngine();