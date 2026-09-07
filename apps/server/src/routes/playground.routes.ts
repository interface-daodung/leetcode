import type { FastifyInstance } from "fastify";
import { createPlaygroundController } from "../controllers/playground.controller.js";

export function registerPlaygroundRoutes(app: FastifyInstance): void {
  const ctrl = createPlaygroundController();
  app.post("/playground/:slug", ctrl.save);
}