import type { FastifyInstance } from "fastify";

const CORS_METHODS = "GET, POST, PUT, DELETE, OPTIONS";
const CORS_HEADERS = "Content-Type";

// CORS cho web (localhost:5173) gọi API
export function registerCors(app: FastifyInstance): void {
  app.addHook("onSend", async (_request, reply) => {
    void reply.header("Access-Control-Allow-Origin", "*");
    void reply.header("Access-Control-Allow-Methods", CORS_METHODS);
    void reply.header("Access-Control-Allow-Headers", CORS_HEADERS);
  });

  app.options("/*", async (_request, reply) => {
    void reply.header("Access-Control-Allow-Origin", "*");
    void reply.header("Access-Control-Allow-Methods", CORS_METHODS);
    void reply.header("Access-Control-Allow-Headers", CORS_HEADERS);
    return reply.code(204).send();
  });
}
