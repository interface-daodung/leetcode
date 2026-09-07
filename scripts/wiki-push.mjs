// Sync docs/wiki/ → GitHub wiki repo (interface-daodung/leetcode.wiki)
// Force push theo policy user đã chọn (không pull/fetch wiki về local).
//
// Usage:
//   pnpm wiki:push            → commit với message tự động + force push
//   pnpm wiki:push -- "msg"   → commit với message custom
//
// Wiki repo default branch: master (GitHub wiki mặc định).
// docs/wiki/.git là repo tách biệt với repo cha, có remote origin trỏ wiki.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const wikiDir = resolve(here, "..", "docs", "wiki");

if (!existsSync(resolve(wikiDir, ".git"))) {
  console.error("[wiki:push] docs/wiki/.git không tồn tại. Chạy clone wiki trước.");
  process.exit(1);
}

const git = (args) => execFileSync("git", args, { cwd: wikiDir, stdio: "inherit" });

const status = execFileSync("git", ["status", "--porcelain"], { cwd: wikiDir, encoding: "utf8" });
if (!status.trim()) {
  console.log("[wiki:push] Không có thay đổi trong docs/wiki/. Bỏ qua.");
  process.exit(0);
}

const msg = process.argv.slice(2).join(" ").trim() || `docs(wiki): sync ${new Date().toISOString().slice(0, 10)}`;

git(["add", "-A"]);
git(["-c", "user.name=wiki-bot", "-c", "user.email=wiki-bot@local", "commit", "-m", msg]);
git(["push", "-f", "origin", "master"]);

console.log(`[wiki:push] OK → ${msg}`);