import { spawnHidden, type SpawnedHandle } from "./index.js";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../");

const targets: Array<{ name: string; cmd: string; cwd: string }> = [
  {
    name: "web",
    cmd: "pnpm exec vite preview",
    cwd: resolve(repoRoot, "apps/web"),
  },
  {
    name: "server",
    cmd: "pnpm exec node dist/index.js",
    cwd: resolve(repoRoot, "apps/server"),
  },
];

const handles: SpawnedHandle[] = [];

for (const t of targets) {
  const h = spawnHidden({ command: t.cmd, cwd: t.cwd });
  handles.push(h);
  console.log(`[start:hidden] ${t.name} PID: ${h.pid ?? "?"}`);
}

const shutdown = (): void => {
  console.log("\n[start:hidden] stopping all...");
  for (const h of handles) h.kill();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const isWin = process.platform === "win32";
let parentGone = false;

const onParentGone = (why: string): void => {
  if (parentGone) return;
  parentGone = true;
  console.log(`\n[start:hidden] parent gone (${why}), killing children...`);
  shutdown();
};

// POSIX: parent terminal close → SIGHUP
// Windows: stdin pipe thường không đóng khi parent cmd.exe exit mềm.
// Fallback: poll process.ppid (Node 16+) — best-effort trên Windows.
if (!isWin) {
  process.on("SIGHUP", () => onParentGone("SIGHUP"));
}
process.stdin.on("end", () => onParentGone("stdin end"));
if (isWin) {
  const watcher = setInterval(() => {
    try {
      process.kill(process.ppid, 0);
    } catch {
      clearInterval(watcher);
      onParentGone("ppid poll");
    }
  }, 500);
  watcher.unref();
}

Promise.all(handles.map((h) => h.promise.catch(() => {}))).then(() => {
  console.log("[start:hidden] all exited");
  process.exit(0);
});