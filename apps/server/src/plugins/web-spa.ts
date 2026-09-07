import fastifyStatic from "@fastify/static";
import type { FastifyInstance } from "fastify";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { WEB_DIST_ROOT, WEB_DIST_AVAILABLE } from "../config.js";

// Serve SPA từ apps/web/dist (React Router cần fallback index.html).
// Phải đăng ký TRƯỚC các route — Fastify match route trước, request
// không match API/health/ws/assets sẽ rơi vào setNotFoundHandler của app.
//
// Note: setNotFoundHandler phải đăng ký TRỰC TIẾP trên app root (không
// trong plugin scope) — handler trong encapsulated plugin không nhận
// request ở root scope. Hàm trả về handler để app.ts đăng ký.
export async function registerWebSpa(app: FastifyInstance): Promise<void> {
  if (!WEB_DIST_AVAILABLE) {
    app.log.warn("WEB_DIST_ROOT không tồn tại — bỏ qua SPA plugin (chỉ phục vụ API).");
    return;
  }

  await app.register(fastifyStatic, {
    root: WEB_DIST_ROOT,
    prefix: "/",
    decorateReply: false,
    wildcard: false,
    index: ["index.html"],
  });

  app.setNotFoundHandler(async (request, reply) => {
    const accept = request.headers.accept ?? "";
    // API path → luôn trả JSON (không rơi vào SPA fallback)
    if (request.url.startsWith("/api/") || request.url.startsWith("/ws/") || request.url === "/health") {
      return reply.code(404).send({ error: "Not Found", path: request.url });
    }
    // Browser request (text/html) → trả SPA index.html
    if (accept.includes("text/html")) {
      try {
        const html = await readFile(join(WEB_DIST_ROOT, "index.html"), "utf8");
        return reply.type("text/html").send(html);
      } catch {
        return reply.code(404).send({ error: "index.html missing" });
      }
    }
    return reply.code(404).send({ error: "Not Found", path: request.url });
  });
}