import Fastify from "fastify";
import { z } from "zod";
import { engine } from "@leetcode/problem-engine";
import { problemDb } from "@leetcode/database";
import { getHint } from "@leetcode/ai";
import { formatProblemId } from "@leetcode/shared";

const app = Fastify({ logger: true });

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

// Hydrate engine từ SQLite khi khởi động (ghi đè fire-and-forget lúc register)
try {
  const rows = await problemDb.getAll();
  for (const row of rows) {
    // row có thể thiếu description/testCases do DB default, ép kiểu Problem
    engine.register({
      id: row.id,
      title: row.title,
      difficulty: row.difficulty as "easy" | "medium" | "hard",
      tags: row.tags ?? [],
      description: row.description ?? "",
      testCases: (row.testCases as { input: unknown; expected: unknown }[]) ?? [],
      solution: row.solution ?? undefined,
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
  // Ưu tiên engine (đã hydrate), fallback DB
  const all = await problemDb.getAll();
  if (all.length > 0) return all;
  // nếu DB rỗng, trả từ engine (có thể có dữ liệu register thủ công chưa flush)
  return [];
});

app.get("/api/problems/:id", async (request, reply) => {
  const params = z.object({ id: z.string().transform(Number) }).parse(request.params);
  let problem = engine.get(params.id);
  if (!problem) {
    const row = await problemDb.get(params.id);
    if (row) {
      problem = {
        id: row.id,
        title: row.title,
        difficulty: row.difficulty as "easy" | "medium" | "hard",
        tags: row.tags ?? [],
        description: row.description ?? "",
        testCases: (row.testCases as { input: unknown; expected: unknown }[]) ?? [],
        solution: row.solution ?? undefined,
      };
    }
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

app.post("/api/problems/import", async (request, reply) => {
  const schema = z.object({
    id: z.number().int().positive(),
    slug: z.string().optional(),
    title: z.string().min(1),
    difficulty: z.enum(["easy", "medium", "hard"]),
    tags: z.array(z.string()).optional().default([]),
    description: z.string().min(1),
    testCases: z.array(z.object({ input: z.unknown(), expected: z.unknown() })).optional().default([]),
    solution: z.string().optional(),
  });

  let parsed: z.infer<typeof schema>;
  try {
    parsed = schema.parse(request.body);
  } catch (e) {
    return reply.code(400).send({ error: "Invalid ProblemClip JSON", details: String(e) });
  }

  // Kiểm tra trùng: đã có trong engine hoặc DB
  const existing = engine.get(parsed.id) ?? (await problemDb.get(parsed.id));
  if (existing) {
    return reply.code(409).send({ error: "Problem already exists", problem: existing });
  }

  const problem: import("@leetcode/problem-engine").Problem = {
    id: parsed.id,
    title: parsed.title,
    difficulty: parsed.difficulty,
    tags: parsed.tags ?? [],
    description: parsed.description,
    testCases: (parsed.testCases as { input: unknown; expected: unknown }[]) ?? [],
    solution: parsed.solution,
  };

  engine.register(problem);
  // Đảm bảo ghi DB xong trước khi trả về (bổ sung cho fire-and-forget trong engine.register)
  try {
    await problemDb.add(problem);
  } catch (e) {
    request.log.warn({ err: e }, "Ghi DB sau import thất bại (có thể đã tồn tại)");
  }

  return reply.code(201).send({ ok: true, problem });
});

app.listen({ port: 3000, host: "0.0.0.0" }).then(() => {
  console.log("Server running on http://localhost:3000");
});