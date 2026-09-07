import { spawn } from "node:child_process";
import { platform } from "node:process";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const isWin = platform === "win32";

interface RunResult {
  code: number | null;
  stdout: string;
}

function run(cmd: string, args: string[]): Promise<RunResult> {
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

async function portPids(ports: number[]): Promise<number[]> {
  if (!isWin) return [];
  const { stdout } = await run("netstat", ["-ano", "-p", "TCP"]);
  const found = new Set<number>();
  for (const line of stdout.split("\n")) {
    const m = line.match(/^\s*TCP\s+\S+:(\d+)\s+\S+\s+LISTENING\s+(\d+)/);
    if (!m) continue;
    const port = Number.parseInt(m[1]!, 10);
    if (ports.includes(port)) found.add(Number.parseInt(m[2]!, 10));
  }
  return [...found];
}

async function winCimProcs(): Promise<Array<{ pid: number; name: string; cmd: string }>> {
  if (!isWin) return [];
  // PowerShell 5.1 escape $_ badly through -Command; use a temp .ps1 file.
  const scriptPath = join(tmpdir(), `tray-spawn-list-${randomBytes(4).toString("hex")}.ps1`);
  const body = `Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -or $_.Name -eq 'pnpm.cmd' -or $_.Name -eq 'cmd.exe' } | Select-Object ProcessId,Name,CommandLine | ConvertTo-Csv -NoTypeInformation`;
  await writeFile(scriptPath, body, "utf8");
  try {
    const { stdout } = await run("powershell", [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      scriptPath,
    ]);
    const rows: Array<{ pid: number; name: string; cmd: string }> = [];
    const lines = stdout.split(/\r?\n/).filter((l) => l.length > 0);
    if (lines.length < 2) return rows;
    for (const line of lines.slice(1)) {
      const m = line.match(/^"(\d+)","([^"]+)","(.*)"$/);
      if (!m) continue;
      rows.push({
        pid: Number.parseInt(m[1]!, 10),
        name: m[2]!,
        cmd: m[3]!.replace(/""/g, '"'),
      });
    }
    return rows;
  } finally {
    unlink(scriptPath).catch(() => undefined);
  }
}

async function pgrepPids(patterns: string[]): Promise<number[]> {
  if (isWin) return [];
  const { stdout } = await run("pgrep", ["-f", patterns.join("|")]);
  return stdout
    .split("\n")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

async function killTree(pid: number): Promise<void> {
  if (isWin) {
    await run("taskkill", ["/pid", String(pid), "/T", "/F"]);
  } else {
    await run("kill", ["-TERM", `-${pid}`]);
  }
}

async function collectCandidates(webPort: number, apiPort: number): Promise<Set<number>> {
  const pids = new Set<number>();

  if (isWin) {
    const procs = await winCimProcs();
    const patterns = [
      /apps[\\/]web[\\/]node_modules[\\/]\.bin[\\/]\.\.[\\/]vite[\\/]bin[\\/]vite\.js/,
      /apps[\\/]server[\\/]dist[\\/]index\.js/,
      /pnpm\.mjs"\s+exec\s+vite\s+preview/,
      /pnpm\.mjs"\s+exec\s+node\s+dist\/index\.js/,
      /pnpm\.mjs"\s+exec\s+node\s+apps[\\/]server[\\/]dist[\\/]index\.js/,
    ];
    for (const p of procs) {
      if (!["node.exe", "pnpm.cmd", "cmd.exe"].includes(p.name)) continue;
      if (patterns.some((re) => re.test(p.cmd))) pids.add(p.pid);
    }
  } else {
    for (const p of await pgrepPids(["vite preview", "dist/index.js"])) pids.add(p);
  }

  for (const p of await portPids([webPort, apiPort])) pids.add(p);

  return pids;
}

async function main(): Promise<void> {
  const webPort = Number.parseInt(process.env.WEB_PORT ?? "4173", 10);
  const apiPort = Number.parseInt(process.env.API_PORT ?? "3000", 10);

  const candidates = await collectCandidates(webPort, apiPort);

  if (candidates.size === 0) {
    console.log("[start:stop] no running process found.");
    return;
  }

  const pids = [...candidates];
  console.log(`[start:stop] killing ${pids.length} process(es): ${pids.join(", ")}`);
  for (const pid of pids) {
    try {
      await killTree(pid);
    } catch (err) {
      console.warn(`[start:stop] pid ${pid} failed:`, (err as Error).message);
    }
  }
  console.log("[start:stop] done.");
}

main().catch((err) => {
  console.error("[start:stop] error:", err);
  process.exit(1);
});
