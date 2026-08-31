import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ProblemService } from "../services/problem.service.js";

const idParams = z.object({ id: z.string().transform(Number) });
const difficultyParams = z.object({ difficulty: z.enum(["easy", "medium", "hard"]).optional() });
const codeBody = z.object({ code: z.string() });

const importSchema = z
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

export function createProblemController(service: ProblemService) {
  /** GET /api/problems */
  async function list(_request: FastifyRequest, _reply: FastifyReply) {
    return service.list();
  }

  /** GET /api/problems/:id */
  async function getById(request: FastifyRequest, reply: FastifyReply) {
    const params = idParams.parse(request.params);
    const result = await service.getById(params.id);
    if (!result) {
      return reply.code(404).send({ error: "Problem not found" });
    }
    return result;
  }

  /** GET /api/problems/random/:difficulty? */
  async function getRandom(request: FastifyRequest, reply: FastifyReply) {
    const params = difficultyParams.parse(request.params);
    const problem = service.getRandom(params.difficulty);
    if (!problem) {
      return reply.code(404).send({ error: "No problems available" });
    }
    return problem;
  }

  /** POST /api/problems/:id/run */
  async function run(request: FastifyRequest, reply: FastifyReply) {
    const params = idParams.parse(request.params);
    const body = codeBody.parse(request.body);
    const result = service.run(params.id, body.code);
    if (result.ok === false) {
      if (result.reason === "not-found") {
        return reply.code(404).send({ error: "Problem not found" });
      }
      return reply.code(400).send({ error: "Invalid code", details: result.error });
    }    return { passed: result.passed, total: result.total, problemId: result.problemId, results: result.results };
  }

  /** POST /api/problems/:id/hint */
  async function hint(request: FastifyRequest, reply: FastifyReply) {
    const params = idParams.parse(request.params);
    const body = codeBody.parse(request.body);
    return service.hint(params.id, body.code);
  }

  /** GET /api/problems/:id/hints */
  async function getHints(request: FastifyRequest, _reply: FastifyReply) {
    const params = idParams.parse(request.params);
    return service.getHints(params.id);
  }

  /** GET /api/problems/:id/assets */
  async function getAssets(request: FastifyRequest, _reply: FastifyReply) {
    const params = idParams.parse(request.params);
    return service.getAssets(params.id);
  }

  /** PUT /api/problems/:id */
  async function updateClip(request: FastifyRequest, reply: FastifyReply) {
    const params = idParams.parse(request.params);
    
    let parsed: z.infer<typeof importSchema>;
    try {
      parsed = importSchema.parse(request.body);
    } catch (e) {
      return reply.code(400).send({ error: "Invalid ProblemClip JSON", details: String(e) });
    }

    // Ensure ID matches
    if (parsed.id !== params.id) {
      return reply.code(400).send({ error: "ID in body does not match URL" });
    }

    const apiBase = process.env.API_URL ?? process.env.VITE_API_URL ?? `http://localhost:${Number(process.env.PORT ?? 3000)}`;
    const result = await service.updateClip(parsed as never, apiBase);
    return reply.code(200).send(result);
  }

  /** POST /api/problems/import */
  async function importClip(request: FastifyRequest, reply: FastifyReply) {
    let parsed: z.infer<typeof importSchema>;
    try {
      parsed = importSchema.parse(request.body);
    } catch (e) {
      return reply.code(400).send({ error: "Invalid ProblemClip JSON", details: String(e) });
    }

    const exists = await service.exists(parsed.id);
    if (exists) {
      return reply.code(409).send({ error: "Problem already exists" });
    }

    const apiBase = process.env.API_URL ?? process.env.VITE_API_URL ?? `http://localhost:${Number(process.env.PORT ?? 3000)}`;
    const result = await service.importClip(parsed as never, apiBase);
    return reply.code(201).send(result);
  }

  return { list, getById, getRandom, run, hint, getHints, getAssets, importClip, updateClip };
}