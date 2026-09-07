import fastifyStatic from "@fastify/static";
import type { FastifyInstance } from "fastify";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { WEB_DIST_ROOT, WEB_DIST_AVAILABLE, ADMIN_DIST_ROOT, ADMIN_DIST_AVAILABLE } from "../config.js";

// Serve SPA: web tại `/`, admin tại `/admin*` (Angular Router + React Router đều
// cần fallback index.html). Phải đăng ký TRƯỚC các route — Fastify match route
// trước, request không match API/health/ws/assets sẽ rơi vào notFoundHandler.
//
// Note: setNotFoundHandler phải đăng ký TRỰC TIẾP trên app root (không trong
// plugin scope) — handler trong encapsulated plugin không nhận request ở
// root scope. Đăng ký trong hàm này (chạy ở root scope).
export async function registerWebSpa(app: FastifyInstance): Promise<void> {
  if (!WEB_DIST_AVAILABLE) {
    app.log.warn("WEB_DIST_ROOT không tồn tại — bỏ qua web SPA (chỉ phục vụ API).");
  } else {
    await app.register(fastifyStatic, {
      root: WEB_DIST_ROOT,
      prefix: "/",
      decorateReply: false,
      wildcard: false,
      index: ["index.html"],
    });
  }

  if (!ADMIN_DIST_AVAILABLE) {
    app.log.warn("ADMIN_DIST_ROOT không tồn tại — bỏ qua admin SPA.");
  } else {
    await app.register(fastifyStatic, {
      root: ADMIN_DIST_ROOT,
      prefix: "/admin/",
      decorateReply: false,
      wildcard: true,
      index: ["index.html"],
    });
  }

  app.setNotFoundHandler(async (request, reply) => {
    const accept = request.headers.accept ?? "";
    // API path → luôn trả JSON (không rơi vào SPA fallback)
    if (request.url.startsWith("/api/") || request.url.startsWith("/ws/") || request.url === "/health") {
      return reply.code(404).send({ error: "Not Found", path: request.url });
    }
    // Browser request (text/html) → trả SPA index.html tương ứng
    if (accept.includes("text/html")) {
      const isAdmin = request.url.startsWith("/admin") || request.url === "/admin";
      const root = isAdmin && ADMIN_DIST_AVAILABLE ? ADMIN_DIST_ROOT : WEB_DIST_ROOT;
      if (!root || !(isAdmin || WEB_DIST_AVAILABLE)) {
        return reply.code(404).send({ error: "SPA not built" });
      }
      try {
        const html = await readFile(join(root, "index.html"), "utf8");
        return reply.type("text/html").send(html);
      } catch {
        return reply.code(404).send({ error: "index.html missing" });
      }
    }
    return reply.code(404).send({ error: "Not Found", path: request.url });
  });
}