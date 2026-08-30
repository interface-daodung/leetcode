import type { FastifyInstance } from "fastify";

// CORS cho web (localhost:5173) gọi API
export function registerCors(app: FastifyInstance): void {
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
}
