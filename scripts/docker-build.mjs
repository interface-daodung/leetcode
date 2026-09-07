#!/usr/bin/env node
// Patch package.json#main + types của các package dùng `src/index.ts`
// sang `dist/index.js` + `dist/index.d.ts` rồi chạy `tsc` (override noEmit).
// Chạy trong Docker builder stage — không sửa file gốc trong source tree.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, join as pathJoin } from "node:path";
import { execSync } from "node:child_process";

const repoRoot = resolve(fileURLToPath(import.meta.url), "../../");
process.chdir(repoRoot);

const packages = ["shared", "database", "problem-engine", "ai"];

for (const name of packages) {
  const pkgPath = pathJoin(repoRoot, "packages", name, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));

  pkg.main = "dist/index.js";
  pkg.types = "dist/index.d.ts";

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  console.log(`[patch] packages/${name}: main=dist/index.js`);
}

// Build từng package bằng tsc CLI, override --noEmit + --declaration
for (const name of packages) {
  console.log(`[build] packages/${name}`);
  execSync(
    `npx tsc -p packages/${name}/tsconfig.json --noEmit false --outDir packages/${name}/dist --declaration --declarationMap --sourceMap`,
    { stdio: "inherit" }
  );
}