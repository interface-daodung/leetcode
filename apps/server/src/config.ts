import { fileURLToPath } from "node:url";

// Thư mục lưu ảnh: packages/database/data/assets (resolve từ import.meta.url, không phụ thuộc CWD)
export const ASSETS_ROOT = fileURLToPath(new URL("../../../packages/database/data/assets", import.meta.url));

// Thư mục playground: repo root/playground (file .js để mở trong VS Code)
export const PLAYGROUND_ROOT = fileURLToPath(new URL("../../../playground", import.meta.url));

// Web SPA build artifacts (apps/web/dist). Trong Docker image copy từ builder stage.
// Khi chạy dev local ngoài Docker, nếu thiếu sẽ warn — không crash server.
import { existsSync } from "node:fs";
export const WEB_DIST_ROOT = fileURLToPath(new URL("../../../apps/web/dist", import.meta.url));
export const WEB_DIST_AVAILABLE = existsSync(WEB_DIST_ROOT);

// Cấu hình server — đọc từ env một chỗ duy nhất
export const config = {
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? "0.0.0.0",
  apiUrl: process.env.API_URL ?? process.env.VITE_API_URL ?? `http://localhost:${Number(process.env.PORT ?? 3000)}`,
};
