import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { engine } from "@leetcode/problem-engine";
import { problemDb } from "@leetcode/database";
import { getHint } from "@leetcode/ai";
import { formatProblemId } from "@leetcode/shared";
import { ASSETS_ROOT, downloadAndRewriteImages } from "./assets.js";

// Load .env từ root monorepo (không phụ thuộc CWD)
try {
  dotenv.config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });
} catch {
  // ignore nếu không có .env
}

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";
const API_URL = process.env.API_URL ?? process.env.VITE_API_URL ?? `http://localhost:${PORT}`;

const app = Fastify({ logger: true });

// Serve ảnh đã tải về: packages/database/data/assets -> /assets/*
await app.register(fastifyStatic, {
  root: ASSETS_ROOT,
  prefix: "/assets/",
  wildcard: false,
  decorateReply: false,
});

// CORS cho web (localhost:5173) gọi API
app.addHook("onSend", async (_request, reply) => {
  void reply.header("Access-Control-Allow-Origin", "*");
  void reply.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  void reply.header("Access-Control-Allow-Headers", "Content-Type");
});

app.options("/*", async (_request, reply) => {
  void reply.header("Access-Control-Allow-Origin", "*");
  void reply.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  void reply.header("Access-Control-Allow-Headers", "Content-Type");
  return reply.code(204).send();
});

// Hydrate engine từ SQLite khi khởi động
try {
  const rows = await problemDb.getAllWithHints();
  for (const row of rows) {
    engine.register({
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
    app.log.info(`Hydrated ${rows.length} problems from SQLite into engine`);
  }
} catch (e) {
  app.log.warn({ err: e }, "Không hydrate được problems từ DB");
}

app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

app.get("/api/problems", async () => {
  const all = await problemDb.getAllWithHints();
  if (all.length > 0) return all;
  return [];
});

app.get("/api/problems/:id", async (request, reply) => {
  const params = z.object({ id: z.string().transform(Number) }).parse(request.params);
  let problem = engine.get(params.id);
  if (!problem) {
    const row = await problemDb.get(params.id);
    if (row) {
      const assets = await problemDb.findAssetsByProblem(params.id);
      const hints = await problemDb.getHints(params.id);
      const hydrated: import("@leetcode/problem-engine").Problem = {
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
      problem = hydrated;
      // đính kèm assets để client biết mapping gốc->local nếu cần
      return { ...hydrated, assets };
    }
  } else {
    // Bổ sung hints/assets nếu engine có nhưng DB có
    const hints = await problemDb.getHints(params.id);
    const assets = await problemDb.findAssetsByProblem(params.id);
    const merged = problem as import("@leetcode/problem-engine").Problem;
    return { ...merged, hints: hints.length ? hints : merged.hints, assets };
  }
  if (!problem) {
    return reply.code(404).send({ error: "Problem not found" });
  }
  return problem;
});

app.get("/api/problems/random/:difficulty?", async (request, reply) => {
  const params = z.object({ difficulty: z.enum(["easy", "medium", "hard"]).optional() }).parse(request.params);
  const problem = engine.getRandom(params.difficulty);
  if (!problem) {
    return reply.code(404).send({ error: "No problems available" });
  }
  return problem;
});

app.post("/api/problems/:id/run", async (request, reply) => {
  const params = z.object({ id: z.string().transform(Number) }).parse(request.params);
  const body = z.object({ code: z.string() }).parse(request.body);

  const problem = engine.get(params.id);
  if (!problem) {
    return reply.code(404).send({ error: "Problem not found" });
  }

  try {
    const solution = new Function("return " + body.code)();
    const result = engine.runTests(params.id, solution);
    return { ...result, problemId: formatProblemId(params.id) };
  } catch (e) {
    return reply.code(400).send({ error: "Invalid code", details: String(e) });
  }
});

app.post("/api/problems/:id/hint", async (request, reply) => {
  const params = z.object({ id: z.string().transform(Number) }).parse(request.params);
  const body = z.object({ code: z.string() }).parse(request.body);
  const hint = await getHint(params.id, body.code);
  return hint;
});

app.get("/api/problems/:id/hints", async (request, reply) => {
  const params = z.object({ id: z.string().transform(Number) }).parse(request.params);
  const hints = await problemDb.getHints(params.id);
  return { hints };
});

app.get("/api/problems/:id/assets", async (request, reply) => {
  const params = z.object({ id: z.string().transform(Number) }).parse(request.params);
  const assets = await problemDb.findAssetsByProblem(params.id);
  return { assets };
});

app.post("/api/problems/import", async (request, reply) => {
  const schema = z
    .object({
      id: z.number({ required_error: "Thiếu id" }).int().positive(),
      slug: z.string().optional().nullable().transform((v) => (v ?? "").trim()),
      title: z.string({ required_error: "Thiếu title" }).min(1).transform((v) => v.trim()).refine((v) => v.length > 0, "title rỗng"),
      difficulty: z.enum(["easy", "medium", "hard"], { required_error: "difficulty phải là easy|medium|hard" }),
      tags: z.array(z.string()).optional().nullable().default([]).transform((arr) => (arr ?? []).map((t) => t.trim()).filter(Boolean)),
      description: z.string({ required_error: "Thiếu description" }).min(1).refine((v) => v.trim().length > 0, "description rỗng"),
      url: z.string().url().optional().nullable().transform((v) => (v ?? "").trim() || undefined),
      template: z.string().optional().nullable().transform((v) => (v ?? "").trim() || undefined),
      hints: z.array(z.string()).optional().nullable().default([]).transform((arr) => (arr ?? []).map((h) => h.trim()).filter(Boolean)),
      clippedAt: z.string().optional().nullable(),
      testCases: z.array(z.object({ input: z.unknown(), expected: z.unknown() })).optional().nullable().default([]),
    })
    .strict();

  let parsed: z.infer<typeof schema>;
  try {
    parsed = schema.parse(request.body);
  } catch (e) {
    return reply.code(400).send({ error: "Invalid ProblemClip JSON", details: String(e) });
  }

  const existing = engine.get(parsed.id) ?? (await problemDb.get(parsed.id));
  if (existing) {
    return reply.code(409).send({ error: "Problem already exists", problem: existing });
  }

  const rawSlug = (parsed.slug && parsed.slug.length > 0 ? parsed.slug : `problem-${parsed.id}`).trim();

  // Tạo problem với description gốc trước để FK problem_assets hợp lệ
  const problem: import("@leetcode/problem-engine").Problem = {
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

  engine.register(problem);
  try {
    await problemDb.add(problem);
  } catch (e) {
    request.log.warn({ err: e }, "Ghi DB sau import thất bại (có thể đã tồn tại)");
  }

  // Sau khi problem đã có trong DB, mới tải ảnh và cập nhật description + assets
  let processedDescription = parsed.description;
  let assetsInserted = false;
  try {
    processedDescription = await downloadAndRewriteImages(parsed.description, rawSlug, API_URL, parsed.id);
    assetsInserted = processedDescription !== parsed.description;
  } catch (e) {
    request.log.warn({ err: e }, "Download ảnh thất bại, giữ nguyên description gốc");
  }

  if (assetsInserted && processedDescription !== parsed.description) {
    try {
      await problemDb.updateDescription(parsed.id, processedDescription);
      // cập nhật engine map
      const eng = engine.get(parsed.id);
      if (eng) eng.description = processedDescription;
      problem.description = processedDescription;
    } catch (e) {
      request.log.warn({ err: e }, "Cập nhật description sau tải ảnh thất bại");
    }
  }

  // Lưu hints riêng (đảm bảo ord đúng) nếu add chưa đủ do race
  if (parsed.hints && parsed.hints.length > 0) {
    try {
      await problemDb.setHints(parsed.id, parsed.hints);
    } catch {}
  }

  const hints = parsed.hints ?? [];
  const assets = await problemDb.findAssetsByProblem(parsed.id).catch(() => []);
  return reply.code(201).send({ ok: true, problem: { ...problem, hints, assets } });
});

app.listen({ port: PORT, host: HOST }).then(() => {
  console.log(`Server running on ${API_URL} (host ${HOST}:${PORT})`);
  console.log(`Assets served from ${ASSETS_ROOT} at ${API_URL}/assets/`);
});
