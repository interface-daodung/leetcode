import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { ProblemService } from "./services/problem.service.js";
import { DocsService } from "./services/docs.service.js";
import { config } from "./config.js";

// Load .env từ root monorepo (không phụ thuộc CWD)
try {
  dotenv.config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });
} catch {
  // ignore nếu không có .env
}

const service = new ProblemService();
const docs = new DocsService();

const app = await createApp({ service, docs });

// Hydrate engine từ SQLite khi khởi động
try {
  await service.hydrate(app.log);
} catch (e) {
  app.log.warn({ err: e }, "Không hydrate được problems từ DB");
}

// Hydrate docs index từ DB (seed nếu DB rỗng docs)
try {
  await docs.hydrate(app.log);
} catch (e) {
  app.log.warn({ err: e }, "Không hydrate được docs từ DB — /api/docs sẽ trả lỗi cho tới khi seed xong");
}

app.listen({ port: config.port, host: config.host }).then(() => {
  console.log(`Server running on ${config.apiUrl} (host ${config.host}:${config.port})`);
});