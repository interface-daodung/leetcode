import type { ProblemMeta } from "@leetcode/shared";
import { db, schema } from "./client.js";
import { eq } from "drizzle-orm";

export class ProblemDatabase {
  async add(problem: ProblemMeta): Promise<void> {
    await db
      .insert(schema.problems)
      .values({
        id: problem.id,
        slug: problem.slug ?? null,
        title: problem.title,
        url: problem.url ?? null,
        difficulty: problem.difficulty,
        tags: problem.tags,
        description: problem.description ?? "",
        template: problem.template ?? null,
        testCases: problem.testCases ?? [],
      })
      .onConflictDoNothing();

    // Lưu hints nếu có
    if (problem.hints && problem.hints.length > 0) {
      const hintRows = problem.hints.map((content, idx) => ({
        problemId: problem.id,
        ord: idx,
        content,
      }));
      // Xoá cũ nếu có (tránh duplicate khi re-add)
      await db.delete(schema.hints).where(eq(schema.hints.problemId, problem.id));
      await db.insert(schema.hints).values(hintRows);
    }
  }

  async get(id: number): Promise<ProblemMeta | undefined> {
    const [row] = await db.select().from(schema.problems).where(eq(schema.problems.id, id)).limit(1);
    if (!row) return undefined;
    const hintRows = await db
      .select()
      .from(schema.hints)
      .where(eq(schema.hints.problemId, id))
      .orderBy(schema.hints.ord);
    const hints = hintRows.map((h) => h.content);
    return {
      ...row,
      slug: row.slug ?? undefined,
      url: row.url ?? undefined,
      template: row.template ?? undefined,
      tags: (row.tags as string[]) ?? [],
      testCases: (row.testCases as { input: unknown; expected: unknown }[]) ?? [],
      hints: hints.length > 0 ? hints : undefined,
    } as ProblemMeta;
  }

  async getByDifficulty(difficulty: ProblemMeta["difficulty"]): Promise<ProblemMeta[]> {
    const rows = await db.select().from(schema.problems).where(eq(schema.problems.difficulty, difficulty));
    // Không load hints cho list để nhẹ; nếu cần có thể join
    return rows.map(
      (row) =>
        ({
          ...row,
          slug: row.slug ?? undefined,
          url: row.url ?? undefined,
          template: row.template ?? undefined,
          tags: (row.tags as string[]) ?? [],
          testCases: (row.testCases as { input: unknown; expected: unknown }[]) ?? [],
        }) as ProblemMeta,
    );
  }

  async getAll(): Promise<ProblemMeta[]> {
    const rows = await db.select().from(schema.problems);
    return rows.map(
      (row) =>
        ({
          ...row,
          slug: row.slug ?? undefined,
          url: row.url ?? undefined,
          template: row.template ?? undefined,
          tags: (row.tags as string[]) ?? [],
          testCases: (row.testCases as { input: unknown; expected: unknown }[]) ?? [],
        }) as ProblemMeta,
    );
  }

  async getAllWithHints(): Promise<ProblemMeta[]> {
    const rows = await db.select().from(schema.problems);
    const allHints = await db.select().from(schema.hints);
    const hintsByProblem = new Map<number, string[]>();
    for (const h of allHints) {
      const arr = hintsByProblem.get(h.problemId) ?? [];
      arr.push(h.content);
      // đảm bảo order theo ord: đã lưu theo ord, nhưng allHints chưa order; sort lại sau
      hintsByProblem.set(h.problemId, arr);
    }
    // Sắp xếp hints theo ord (cần query có order)
    // Thay vì map lung tung, query riêng cho từng problem hoặc sort:
    // Đơn giản: đã insert theo ord, DB trả về không đảm bảo order nên sort bằng ord index
    // Ta đã lưu nhưng không sort — sẽ query lại có order cho chắc
    // Ở đây ta sẽ làm lại: fetch hints ordered
    const orderedHints = await db.select().from(schema.hints).orderBy(schema.hints.problemId, schema.hints.ord);
    hintsByProblem.clear();
    for (const h of orderedHints) {
      const arr = hintsByProblem.get(h.problemId) ?? [];
      arr.push(h.content);
      hintsByProblem.set(h.problemId, arr);
    }

    return rows.map(
      (row) =>
        ({
          ...row,
          slug: row.slug ?? undefined,
          url: row.url ?? undefined,
          template: row.template ?? undefined,
          tags: (row.tags as string[]) ?? [],
          testCases: (row.testCases as { input: unknown; expected: unknown }[]) ?? [],
          hints: hintsByProblem.get(row.id),
        }) as ProblemMeta,
    );
  }

  async delete(id: number): Promise<void> {
    await db.delete(schema.problems).where(eq(schema.problems.id, id));
    // cascade sẽ xoá hints + assets, nhưng đảm bảo
    await db.delete(schema.hints).where(eq(schema.hints.problemId, id));
    await db.delete(schema.problemAssets).where(eq(schema.problemAssets.problemId, id));
  }

  // ---- Assets ----

  async addAsset(asset: { problemId: number; originalUrl: string; localPath: string; hash: string }): Promise<void> {
    await db.insert(schema.problemAssets).values(asset);
  }

  async findAssetByHash(hash: string): Promise<{ localPath: string; originalUrl: string } | undefined> {
    const [row] = await db.select().from(schema.problemAssets).where(eq(schema.problemAssets.hash, hash)).limit(1);
    if (!row) return undefined;
    return { localPath: row.localPath, originalUrl: row.originalUrl };
  }

  async findAssetsByProblem(problemId: number) {
    return db.select().from(schema.problemAssets).where(eq(schema.problemAssets.problemId, problemId));
  }

  async findAssetByOriginalUrl(problemId: number, originalUrl: string) {
    const [row] = await db
      .select()
      .from(schema.problemAssets)
      .where(eq(schema.problemAssets.problemId, problemId))
      .limit(1);
    // Nếu cần tìm theo originalUrl cụ thể, dùng and()
    // Tạm dùng query thủ công:
    const all = await db.select().from(schema.problemAssets).where(eq(schema.problemAssets.problemId, problemId));
    return all.find((r) => r.originalUrl === originalUrl);
  }

  // ---- Hints ----

  async getHints(problemId: number): Promise<string[]> {
    const rows = await db
      .select()
      .from(schema.hints)
      .where(eq(schema.hints.problemId, problemId))
      .orderBy(schema.hints.ord);
    return rows.map((r) => r.content);
  }

  async setHints(problemId: number, hints: string[]): Promise<void> {
    await db.delete(schema.hints).where(eq(schema.hints.problemId, problemId));
    if (hints.length === 0) return;
    await db.insert(schema.hints).values(
      hints.map((content, ord) => ({
        problemId,
        ord,
        content,
      })),
    );
  }

  async updateDescription(id: number, description: string): Promise<void> {
    await db.update(schema.problems).set({ description }).where(eq(schema.problems.id, id));
  }

  async update(id: number, patch: Partial<Pick<ProblemMeta, "description" | "template" | "url" | "slug">>): Promise<void> {
    const set: Record<string, unknown> = {};
    if (patch.description !== undefined) set["description"] = patch.description;
    if (patch.template !== undefined) set["template"] = patch.template;
    if (patch.url !== undefined) set["url"] = patch.url;
    if (patch.slug !== undefined) set["slug"] = patch.slug;
    if (Object.keys(set).length === 0) return;
    await db.update(schema.problems).set(set as never).where(eq(schema.problems.id, id));
  }
}

export const problemDb = new ProblemDatabase();
