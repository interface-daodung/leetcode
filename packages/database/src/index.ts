import type { ProblemMeta, Difficulty } from "@leetcode/shared";

export class ProblemDatabase {
  private problems: Map<number, ProblemMeta> = new Map();

  add(problem: ProblemMeta): void {
    this.problems.set(problem.id, problem);
  }

  get(id: number): ProblemMeta | undefined {
    return this.problems.get(id);
  }

  getByDifficulty(difficulty: Difficulty): ProblemMeta[] {
    return Array.from(this.problems.values()).filter((p) => p.difficulty === difficulty);
  }

  getAll(): ProblemMeta[] {
    return Array.from(this.problems.values());
  }
}

export const db = new ProblemDatabase();