import { spawn } from "node:child_process";
import { platform } from "node:process";

const isWin = platform === "win32";

function run(cmd: string, args: string[]): Promise<{ code: number | null; stdout: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      shell: isWin,
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"],
    });
    let stdout = "";
    child.stdout?.on("data", (d: Buffer) => (stdout += d.toString()));
    child.once("error", reject);
    child.once("exit", (code) => resolve({ code, stdout }));
  });
}

async function findPreviewPids(): Promise<number[]> {
  if (!isWin) {
    const { stdout } = await run("pgrep", ["-f", "pnpm preview"]);
    return stdout
      .split("\n")
      .map((s) => Number.parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n) && n > 0);
  }

  const { stdout } = await run("tasklist", ["/FI", "IMAGENAME eq pnpm.cmd", "/FO", "CSV", "/NH"]);
  const pids: number[] = [];
  for (const line of stdout.split("\n")) {
    const m = line.match(/^"?[^"]+"?,\s*(\d+)/);
    if (m && m[1]) pids.push(Number.parseInt(m[1], 10));
  }
  return pids;
}

async function killTree(pid: number): Promise<void> {
  if (!isWin) {
    await run("kill", ["-TERM", `-${pid}`]);
    return;
  }
  await run("taskkill", ["/pid", String(pid), "/T", "/F"]);
}

async function main(): Promise<void> {
  const pids = await findPreviewPids();
  if (pids.length === 0) {
    console.log("[preview:kill] no preview process found.");
    return;
  }
  console.log(`[preview:kill] killing ${pids.length} process(es): ${pids.join(", ")}`);
  for (const pid of pids) {
    try {
      await killTree(pid);
    } catch (err) {
      console.warn(`[preview:kill] pid ${pid} failed:`, (err as Error).message);
    }
  }
  console.log("[preview:kill] done.");
}

main().catch((err) => {
  console.error("[preview:kill] error:", err);
  process.exit(1);
});