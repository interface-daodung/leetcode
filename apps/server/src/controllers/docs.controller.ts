import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import type { DocsService } from "../services/docs.service.js";

const langQuery = z.object({
  lang: z.enum(["en", "vi"]).optional().default("en"),
});

const searchQuery = langQuery.extend({
  q: z.string().optional().default(""),
  category: z.string().optional(),
  keyword: z.string().optional(),
  limit: z.coerce.number().int().positive().max(1000).optional().default(20),
});

const sectionParams = z.object({ id: z.string().min(1) });

export function createDocsController(service: DocsService) {
  /** GET /api/docs/search?q=&lang=&category=&keyword=&limit= */
  async function search(request: FastifyRequest, _reply: FastifyReply) {
    const q = searchQuery.safeParse(request.query);
    if (!q.success) return _reply.code(400).send({ error: "Tham số không hợp lệ", detail: q.error.flatten() });
    const p = q.data;
    return service.search(p.q, p.lang, { category: p.category, keyword: p.keyword, limit: p.limit });
  }

  /** GET /api/docs/categories?lang= */
  async function categories(request: FastifyRequest, _reply: FastifyReply) {
    const q = langQuery.safeParse(request.query);
    if (!q.success) return _reply.code(400).send({ error: "Tham số không hợp lệ" });
    return service.getCategories(q.data.lang);
  }

  /** GET /api/docs/section/:id?lang= */
  async function getSection(request: FastifyRequest, reply: FastifyReply) {
    const params = sectionParams.safeParse(request.params);
    if (!params.success) return reply.code(400).send({ error: "Thiếu id" });
    const q = langQuery.safeParse(request.query);
    if (!q.success) return reply.code(400).send({ error: "Tham số không hợp lệ" });
    const section = service.getSection(params.data.id, q.data.lang);
    if (!section) return reply.code(404).send({ error: "Section not found" });
    return section;
  }

  /** GET /api/docs/meta?lang= — entries cho client autocomplete */
  async function meta(request: FastifyRequest, _reply: FastifyReply) {
    const q = langQuery.safeParse(request.query);
    if (!q.success) return _reply.code(400).send({ error: "Tham số không hợp lệ" });
    return service.getMeta(q.data.lang);
  }

  return { search, categories, getSection, meta };
}
