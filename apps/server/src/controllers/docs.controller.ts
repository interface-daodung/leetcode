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
    const q = searchQuery.parse(request.query);
    return service.search(q.q, q.lang, { category: q.category, keyword: q.keyword, limit: q.limit });
  }

  /** GET /api/docs/categories?lang= */
  async function categories(request: FastifyRequest, _reply: FastifyReply) {
    const q = langQuery.parse(request.query);
    return service.getCategories(q.lang);
  }

  /** GET /api/docs/section/:id?lang= */
  async function getSection(request: FastifyRequest, reply: FastifyReply) {
    const params = sectionParams.parse(request.params);
    const q = langQuery.parse(request.query);
    const section = service.getSection(params.id, q.lang);
    if (!section) return reply.code(404).send({ error: "Section not found" });
    return section;
  }

  /** GET /api/docs/meta?lang= — entries cho client autocomplete */
  async function meta(request: FastifyRequest, _reply: FastifyReply) {
    const q = langQuery.parse(request.query);
    return service.getMeta(q.lang);
  }

  return { search, categories, getSection, meta };
}
