import Fastify from "fastify";
import { registerCors } from "./plugins/cors.js";
import { registerStatic } from "./plugins/static.js";
import { registerRoutes } from "./routes/index.js";
import { ProblemService } from "./services/problem.service.js";

// Tạo Fastify instance + đăng ký plugin & route — tách khỏi listen để dễ test
export async function createApp(deps: { service?: ProblemService } = {}) {
  const app = Fastify({ logger: true });
  const service = deps.service ?? new ProblemService();

  registerCors(app);
  await registerStatic(app);
  registerRoutes(app, service);

  return app;
}
