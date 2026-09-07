import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import { registerCors } from "./plugins/cors.js";
import { registerStatic } from "./plugins/static.js";
import { registerWebSpa } from "./plugins/web-spa.js";
import { registerRoutes } from "./routes/index.js";
import { ProblemService } from "./services/problem.service.js";

// Tạo Fastify instance + đăng ký plugin & route — tách khỏi listen để dễ test
export async function createApp(deps: { service?: ProblemService } = {}) {
  const app = Fastify({ logger: true });
  const service = deps.service ?? new ProblemService();

  await app.register(fastifyWebsocket);
  registerCors(app);
  // Web SPA phải đăng ký trước các route API — request không match
  // /api/*, /health, /ws/* sẽ rơi vào static và được trả index.html.
  await registerWebSpa(app);
  await registerStatic(app);
  registerRoutes(app, service);

  return app;
}