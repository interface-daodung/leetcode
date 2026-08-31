#!/usr/bin/env node
// Đồng bộ ảnh icon từ packages/shared/asset/icon sang apps/extension/assets
// Extension MV3 (vanilla, không bundler) chỉ dùng được ảnh nằm trong package,
// nên copy từ shared để dùng chung một nguồn icon.
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const srcDir = fileURLToPath(new URL("../../../packages/shared/asset/icon", import.meta.url));
const outDir = fileURLToPath(new URL("../assets", import.meta.url));

mkdirSync(outDir, { recursive: true });

let count = 0;
for (const name of readdirSync(srcDir)) {
  // Copy mọi file ảnh (png/webp/ico...), bỏ file placeholder .gitkeep
  if (name.startsWith(".")) continue;
  const from = path.join(srcDir, name);
  const to = path.join(outDir, name);
  copyFileSync(from, to);
  count++;
  console.log(`[sync-icons] Copied ${from} -> ${to}`);
}
console.log(`[sync-icons] Done. ${count} file(s) synced.`);
