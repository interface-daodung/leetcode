import { engine, type Problem } from "@leetcode/problem-engine";
import { problemDb, type ProblemDatabase } from "@leetcode/database";
import { getHint } from "@leetcode/ai";
import type { FastifyBaseLogger } from "fastify";
import type { ProblemClip } from "@leetcode/shared";
import { downloadAndRewriteImages, ensureAssetFiles } from "./asset.service.js";

export type RunOutcome =
  | { ok: true; passed: number; total: number; problemId: string }
  | { ok: false; reason: "not-found" }
  | { ok: false; reason: "invalid-code"; error: string };

export interface ImportClipResult {
  ok: true;
  problem: Problem & { hints: string[]; assets: unknown[] };
}

export class ProblemService {
  constructor(
    private readonly db: ProblemDatabase = problemDb,
    private readonly reg: typeof engine = engine,
  ) {}

  /** Nạp toàn bộ problems từ SQLite vào engine khi khởi động */
  async hydrate(log: FastifyBaseLogger): Promise<void> {
    const rows = await this.db.getAllWithHints();
    for (const row of rows) {
      this.reg.register({
        id: row.id,
        slug: row.slug,
        title: row.title,
        url: row.url,
        difficulty: row.difficulty as "easy" | "medium" | "hard",
        tags: row.tags ?? [],
        description: row.description ?? "",
        template: row.template ?? undefined,
        testCases: (row.testCases as { input: unknown; expected: unknown }[]) ?? [],
        hints: row.hints ?? undefined,
      });
    }
    if (rows.length > 0) {
      log.info(`Hydrated ${rows.length} problems from SQLite into engine`);
    }
    // Đảm bảo mọi asset đã có file trên đĩa (tải lại nếu thiếu) — ảnh luôn hiển thị
    for (const row of rows) {
      try {
        const assets = await this.db.findAssetsByProblem(row.id);
        await ensureAssetFiles(assets);
      } catch {
        // bỏ qua nếu không lấy được assets
      }
    }
  }

  async list(): Promise<unknown[]> {
    const all = await this.db.getAllWithHints();
    return all.length > 0 ? all : [];
  }

  async getById(id: number): Promise<unknown | undefined> {
    let problem = this.reg.get(id);
    if (!problem) {
      const row = await this.db.get(id);
      if (row) {
        const assets = await this.db.findAssetsByProblem(id);
        const hints = await this.db.getHints(id);
        const hydrated: Problem = {
          id: row.id,
          slug: row.slug,
          title: row.title,
          url: row.url,
          difficulty: row.difficulty as "easy" | "medium" | "hard",
          tags: row.tags ?? [],
          description: row.description ?? "",
          template: row.template ?? undefined,
          testCases: (row.testCases as { input: unknown; expected: unknown }[]) ?? [],
          hints: hints.length > 0 ? hints : undefined,
        };
        // đính kèm assets để client biết mapping gốc->local nếu cần
        await ensureAssetFiles(assets);
        return { ...hydrated, assets };
      }
      return undefined;
    }

    // Bổ sung hints/assets nếu engine có nhưng DB có
    const hints = await this.db.getHints(id);
    const assets = await this.db.findAssetsByProblem(id);
    await ensureAssetFiles(assets);
    return { ...problem, hints: hints.length ? hints : problem.hints, assets };
  }

  getRandom(difficulty?: "easy" | "medium" | "hard"): Problem | undefined {
    return this.reg.getRandom(difficulty);
  }

  run(id: number, code: string): RunOutcome {
    const problem = this.reg.get(id);
    if (!problem) return { ok: false, reason: "not-found" };
    try {
      const solution = new Function("return " + code)();
      const result = this.reg.runTests(id, solution);
      return { ok: true, ...result, problemId: `LC${String(id).padStart(4, "0")}` };
    } catch (e) {
      return { ok: false, reason: "invalid-code", error: String(e) };
    }
  }

  hint(id: number, code: string): Promise<unknown> {
    return getHint(id, code);
  }

  async getHints(id: number): Promise<{ hints: string[] }> {
    const hints = await this.db.getHints(id);
    return { hints };
  }

  async getAssets(id: number): Promise<{ assets: unknown }> {
    const assets = await this.db.findAssetsByProblem(id);
    return { assets };
  }

  async exists(id: number): Promise<boolean> {
    return Boolean(this.reg.get(id) ?? (await this.db.get(id)));
  }

  /** Flow import: validate-đã xong ở controller, ở đây chỉ thao tác engine + DB + ảnh */
  async importClip(parsed: ProblemClip, apiBase: string): Promise<ImportClipResult> {
    const rawSlug = (parsed.slug && parsed.slug.length > 0 ? parsed.slug : `problem-${parsed.id}`).trim();

    // Tạo problem với description gốc trước để FK problem_assets hợp lệ
    const problem: Problem = {
      id: parsed.id,
      slug: rawSlug,
      title: parsed.title,
      url: parsed.url,
      difficulty: parsed.difficulty,
      tags: parsed.tags ?? [],
      description: parsed.description,
      template: parsed.template,
      testCases: (parsed.testCases as { input: unknown; expected: unknown }[]) ?? [],
      hints: parsed.hints ?? undefined,
    };

    this.reg.register(problem);
    try {
      await this.db.add(problem);
    } catch {
      // ghi DB sau import thất bại (có thể đã tồn tại) — không chặn flow
    }

    // Sau khi problem đã có trong DB, mới tải ảnh và cập nhật description + assets
    let processedDescription = parsed.description;
    let assetsInserted = false;
    try {
      processedDescription = await downloadAndRewriteImages(parsed.description, rawSlug, apiBase, parsed.id);
      assetsInserted = processedDescription !== parsed.description;
    } catch {
      // Download ảnh thất bại, giữ nguyên description gốc
    }

    if (assetsInserted && processedDescription !== parsed.description) {
      try {
        await this.db.updateDescription(parsed.id, processedDescription);
        const eng = this.reg.get(parsed.id);
        if (eng) eng.description = processedDescription;
        problem.description = processedDescription;
      } catch {
        // Cập nhật description sau tải ảnh thất bại
      }
    }

    // Lưu hints riêng (đảm bảo ord đúng) nếu add chưa đủ do race
    if (parsed.hints && parsed.hints.length > 0) {
      try {
        await this.db.setHints(parsed.id, parsed.hints);
      } catch {
        // ignore
      }
    }

    const hints = parsed.hints ?? [];
    const assets = await this.db.findAssetsByProblem(parsed.id).catch(() => []);
    return { ok: true, problem: { ...problem, hints, assets } };
  }
}