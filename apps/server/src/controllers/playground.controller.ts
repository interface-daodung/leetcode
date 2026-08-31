import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { saveToPlayground } from "../services/playground.service.js";

const playgroundParams = z.object({
  slug: z.string().min(1),
});

const playgroundBody = z.object({
  code: z.string().min(1, "Thiếu code"),
});

export function createPlaygroundController() {
  async function save(request: FastifyRequest, reply: FastifyReply) {
    const params = playgroundParams.parse(request.params);
    const body = playgroundBody.parse(request.body);
    try {
      const result = await saveToPlayground(params.slug, body.code);
      return reply.code(200).send(result);
    } catch (e) {
      return reply.code(500).send({ error: "Không ghi được file", details: String(e) });
    }
  }
  return { save };
}