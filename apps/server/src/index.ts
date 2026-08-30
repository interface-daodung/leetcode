import Fastify from "fastify";
import { z } from "zod";
import { engine } from "@leetcode/problem-engine";
import { getHint } from "@leetcode/ai";
import { formatProblemId } from "@leetcode/shared";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

app.get("/api/problems/:id", async (request, reply) => {
  const params = z.object({ id: z.string().transform(Number) }).parse(request.params);
  const problem = engine.get(params.id);
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

app.listen({ port: 3000, host: "0.0.0.0" }).then(() => {
  console.log("Server running on http://localhost:3000");
});