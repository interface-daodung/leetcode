#!/usr/bin/env node
// Đọc root .env và sinh api-config.js cho extension để đồng bộ host với server/web
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootEnvPath = fileURLToPath(new URL("../../../.env", import.meta.url));
const outPath = fileURLToPath(new URL("../api-config.js", import.meta.url));

function parseEnv(raw) {
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx).trim();
    const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    env[k] = v;
  }
  return env;
}

let apiBase = "http://localhost:3000";
try {
  const raw = readFileSync(rootEnvPath, "utf-8");
  const env = parseEnv(raw);
  apiBase = env.EXTENSION_API_URL || env.API_URL || env.VITE_API_URL || apiBase;
  // loại bỏ trailing slash
  apiBase = apiBase.replace(/\/$/, "");
} catch (e) {
  console.warn(`[sync-api-url] Không đọc được ${rootEnvPath}, dùng fallback ${apiBase}: ${e.message}`);
}

const content = `// Auto-generated từ root .env (EXTENSION_API_URL / API_URL). Đừng sửa tay — chạy \`pnpm --filter @leetcode/extension sync:config\` để regenerate.\n// Source: ${rootEnvPath}\nvar LC_API_BASE = "${apiBase}";\n`;
writeFileSync(outPath, content, "utf-8");
console.log(`[sync-api-url] Wrote ${outPath} -> LC_API_BASE=${apiBase}`);

// Đồng bộ host_permissions trong manifest.json nếu apiBase không phải localhost mặc định
try {
  const manifestPath = fileURLToPath(new URL("../manifest.json", import.meta.url));
  const manifestRaw = readFileSync(manifestPath, "utf-8");
  const manifest = JSON.parse(manifestRaw);
  const apiHost = new URL(apiBase).origin + "/*";
  const hosts = new Set(manifest.host_permissions || []);
  // Luôn giữ leetcode và localhost, thêm origin của apiBase nếu khác
  hosts.add("*://leetcode.com/*");
  hosts.add("http://localhost/*");
  hosts.add("http://127.0.0.1/*");
  if (apiHost !== "http://localhost:3000/*" && apiHost !== "http://localhost/*") {
    hosts.add(apiHost);
  }
  manifest.host_permissions = [...hosts];
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
  console.log(`[sync-api-url] Updated manifest host_permissions -> ${JSON.stringify(manifest.host_permissions)}`);
} catch (e) {
  console.warn(`[sync-api-url] Không cập nhật được manifest: ${e.message}`);
}
