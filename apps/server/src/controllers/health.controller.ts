import type { FastifyRequest, FastifyReply } from "fastify";

// GET /health — kiểm tra server còn sống
export async function healthHandler(_request: FastifyRequest, _reply: FastifyReply) {
  return { status: "ok", timestamp: new Date().toISOString() };
}
