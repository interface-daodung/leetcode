import type { ProblemMeta, Difficulty } from "@leetcode/shared";
import { db, schema } from "./client.js";
import { eq } from "drizzle-orm";

export class ProblemDatabase {
  async add(problem: ProblemMeta): Promise<void> {
    await db
      .insert(schema.problems)
      .values({
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        tags: problem.tags,
        description: problem.description ?? "",
        testCases: problem.testCases ?? [],
        solution: problem.solution,
      })
      .onConflictDoNothing();
  }

  async get(id: number): Promise<ProblemMeta | undefined> {
    const [row] = await db.select().from(schema.problems).where(eq(schema.problems.id, id)).limit(1);
    return row as ProblemMeta | undefined;
  }

  async getByDifficulty(difficulty: Difficulty): Promise<ProblemMeta[]> {
    const rows = await db.select().from(schema.problems).where(eq(schema.problems.difficulty, difficulty));
    return rows as ProblemMeta[];
  }

  async getAll(): Promise<ProblemMeta[]> {
    const rows = await db.select().from(schema.problems);
    return rows as ProblemMeta[];
  }

  async delete(id: number): Promise<void> {
    await db.delete(schema.problems).where(eq(schema.problems.id, id));
  }
}

export const problemDb = new ProblemDatabase();