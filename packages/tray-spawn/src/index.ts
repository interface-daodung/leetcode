import { spawn } from "node:child_process";

export interface SpawnOpts {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  command?: string;
}

export interface SpawnedHandle {
  pid: number | undefined;
  kill: () => void;
  promise: Promise<void>;
}

const isWin = process.platform === "win32";

export function spawnHidden(opts: SpawnOpts = {}): SpawnedHandle {
  const command = opts.command ?? "node .";
  const shellCmd = isWin ? `cmd.exe /c start "" /B ${command}` : command;
  const child = spawn(shellCmd, {
    shell: true,
    windowsHide: true,
    stdio: "ignore",
    cwd: opts.cwd ?? process.cwd(),
    env: { ...process.env, ...opts.env },
    detached: false,
  });

  const promise = new Promise<void>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", () => resolve());
  });

  const kill = (): void => {
    if (child.exitCode !== null) return;
    const pid = child.pid;
    if (pid === undefined) return;

    if (isWin) {
      const killer = spawn("taskkill", ["/pid", String(pid), "/T", "/F"], {
        shell: true,
        stdio: "ignore",
        windowsHide: true,
      });
      killer.unref();
    } else {
      try {
        process.kill(-pid, "SIGTERM");
      } catch {
        try {
          child.kill("SIGTERM");
        } catch {
          // process already gone
        }
      }
    }
  };

  return { pid: child.pid, kill, promise };
}