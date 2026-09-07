import type { FastifyInstance } from "fastify";
import { createDocsController } from "../controllers/docs.controller.js";
import type { DocsService } from "../services/docs.service.js";

// Đăng ký route /api/docs* — prefix /api được thêm ở routes/index.ts
export function registerDocsRoutes(app: FastifyInstance, service: DocsService): void {
  const ctrl = createDocsController(service);

  app.get("/docs/search", ctrl.search);
  app.get("/docs/categories", ctrl.categories);
  app.get("/docs/section/:id", ctrl.getSection);
  app.get("/docs/meta", ctrl.meta);
}
