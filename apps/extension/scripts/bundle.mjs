// Bundle src/index.ts → content.js bằng esbuild (IIFE, browser).
// Chạy trong `pnpm --filter=@leetcode/extension build`.
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..");

await build({
  entryPoints: [path.join(root, "src/index.ts")],
  bundle: true,
  format: "iife",
  outfile: path.join(root, "content.js"),
  target: "es2022",
  platform: "browser",
  minify: false,
  sourcemap: false,
});

console.log("[bundle] content.js đã được build từ src/index.ts");
