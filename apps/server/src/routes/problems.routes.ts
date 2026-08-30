import type { FastifyInstance } from "fastify";
import { createProblemController } from "../controllers/problems.controller.js";
import type { ProblemService } from "../services/problem.service.js";

// Đăng ký toàn bộ route /api/problems* — prefix /api được thêm ở routes/index.ts
export function registerProblemRoutes(app: FastifyInstance, service: ProblemService): void {
  const ctrl = createProblemController(service);

  app.get("/problems", ctrl.list);
  app.get("/problems/:id", ctrl.getById);
  app.get("/problems/random/:difficulty?", ctrl.getRandom);
  app.post("/problems/:id/run", ctrl.run);
  app.post("/problems/:id/hint", ctrl.hint);
  app.get("/problems/:id/hints", ctrl.getHints);
  app.get("/problems/:id/assets", ctrl.getAssets);
  app.post("/problems/import", ctrl.importClip);
}
