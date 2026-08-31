import type { FastifyInstance } from "fastify";
import { registerHealthRoutes } from "./health.routes.js";
import { registerProblemRoutes } from "./problems.routes.js";
import { registerPlaygroundRoutes } from "./playground.routes.js";
import type { ProblemService } from "../services/problem.service.js";

// Router tổng: gom tất cả route (không prefix để /health không bị /api)
export function registerRoutes(app: FastifyInstance, service: ProblemService): void {
  registerHealthRoutes(app);
  app.register(
    async (api) => {
      registerProblemRoutes(api, service);
      registerPlaygroundRoutes(api);
    },
    { prefix: "/api" },
  );
}
