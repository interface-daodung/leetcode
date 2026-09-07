import { fileURLToPath } from "node:url";

// Thư mục lưu ảnh: packages/database/data/assets (resolve từ import.meta.url, không phụ thuộc CWD)
export const ASSETS_ROOT = fileURLToPath(new URL("../../../packages/database/data/assets", import.meta.url));

// Thư mục playground: repo root/playground (file .js để mở trong VS Code)
export const PLAYGROUND_ROOT = fileURLToPath(new URL("../../../playground", import.meta.url));

// Web SPA build artifacts (apps/web/dist). Trong Docker image copy từ builder stage.
// Khi chạy dev local ngoài Docker, nếu thiếu sẽ warn — không crash server.
import { existsSync, statSync } from "node:fs";
export const WEB_DIST_ROOT = fileURLToPath(new URL("../../../apps/web/dist", import.meta.url));
export const WEB_DIST_AVAILABLE = existsSync(WEB_DIST_ROOT);

// Admin SPA build artifacts. Angular 18 application builder emits `dist/admin/browser`
// (subfolder = `browser`); nếu không có thì dùng chính `dist/admin` (fallback).
export const ADMIN_DIST_ROOT = (() => {
  const root = fileURLToPath(new URL("../../../apps/admin/dist/admin/browser", import.meta.url));
  if (existsSync(root) && statSync(root).isDirectory()) return root;
  const flat = fileURLToPath(new URL("../../../apps/admin/dist/admin", import.meta.url));
  return existsSync(flat) ? flat : root;
})();
export const ADMIN_DIST_AVAILABLE = existsSync(ADMIN_DIST_ROOT) && statSync(ADMIN_DIST_ROOT).isDirectory();

// Cấu hình server — đọc từ env một chỗ duy nhất
export const config = {
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? "0.0.0.0",
  apiUrl: process.env.API_URL ?? process.env.VITE_API_URL ?? `http://localhost:${Number(process.env.PORT ?? 3000)}`,
};
