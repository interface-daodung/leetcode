import type { FastifyInstance } from "fastify";
import { createAiController } from "../controllers/ai.controller.js";

// WebSocket /ws/ai — AI hướng dẫn giải (prompt ở server, không lộ ra client)
export function registerAiRoutes(app: FastifyInstance): void {
  const ctrl = createAiController();
  app.get("/ws/ai", { websocket: true }, ctrl.handle);
}
