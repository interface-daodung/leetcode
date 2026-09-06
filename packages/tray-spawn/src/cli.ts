import { spawnHidden } from "./index.js";

const handle = spawnHidden();
console.log(`[preview:hidden] PID: ${handle.pid ?? "?"}`);

const shutdown = (): void => {
  console.log("\n[preview:hidden] stopping...");
  handle.kill();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

handle.promise
  .then(() => {
    console.log("[preview:hidden] exited");
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error("[preview:hidden] failed:", err);
    process.exit(1);
  });