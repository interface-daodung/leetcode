import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { ProblemService } from "./services/problem.service.js";
import { config } from "./config.js";

// Load .env từ root monorepo (không phụ thuộc CWD)
try {
  dotenv.config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });
} catch {
  // ignore nếu không có .env
}

const service = new ProblemService();

const app = await createApp({ service });

// Hydrate engine từ SQLite khi khởi động
try {
  await service.hydrate(app.log);
} catch (e) {
  app.log.warn({ err: e }, "Không hydrate được problems từ DB");
}

app.listen({ port: config.port, host: config.host }).then(() => {
  console.log(`Server running on ${config.apiUrl} (host ${config.host}:${config.port})`);
});