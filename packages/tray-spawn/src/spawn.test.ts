import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "node:events";
import { spawnHidden } from "./index.js";

vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
}));

import { spawn } from "node:child_process";

interface FakeChild extends EventEmitter {
  pid: number | undefined;
  exitCode: number | null;
  kill: ReturnType<typeof vi.fn>;
}

function makeFakeChild(pid = 1234): FakeChild {
  const ee = new EventEmitter() as FakeChild;
  ee.pid = pid;
  ee.exitCode = null;
  ee.kill = vi.fn();
  // Taskkill child needs unref(); expose it via EventEmitter wrapper
  (ee as unknown as { unref: () => void }).unref = () => undefined;
  return ee;
}

beforeEach(() => {
  vi.mocked(spawn).mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("spawnHidden", () => {
  it("spawns once with windowsHide + stdio ignore", () => {
    const fake = makeFakeChild();
    vi.mocked(spawn).mockReturnValue(fake as never);

    spawnHidden();

    expect(spawn).toHaveBeenCalledTimes(1);
    const [cmd, passed] = vi.mocked(spawn).mock.calls[0]!;
    const expected = process.platform === "win32"
      ? 'cmd.exe /c start "" /B node .'
      : "node .";
    expect(cmd).toBe(expected);
    expect(passed).toMatchObject({
      shell: true,
      windowsHide: true,
      stdio: "ignore",
      detached: false,
    });
  });

  it("passes cwd + env overrides", () => {
    const fake = makeFakeChild();
    vi.mocked(spawn).mockReturnValue(fake as never);

    spawnHidden({
      cwd: "D:/work",
      env: { FOO: "bar" },
      command: "node server.js",
    });

    const [cmd, passed] = vi.mocked(spawn).mock.calls[0]!;
    const expected = process.platform === "win32"
      ? 'cmd.exe /c start "" /B node server.js'
      : "node server.js";
    expect(cmd).toBe(expected);
    expect(passed).toMatchObject({
      cwd: "D:/work",
      env: expect.objectContaining({ FOO: "bar" }),
    });
  });

  it("returns pid from child", () => {
    const fake = makeFakeChild(7777);
    vi.mocked(spawn).mockReturnValue(fake as never);

    const handle = spawnHidden();
    expect(handle.pid).toBe(7777);
  });

  it("resolves promise when child exits", async () => {
    const fake = makeFakeChild();
    vi.mocked(spawn).mockReturnValue(fake as never);

    const handle = spawnHidden();
    const exited = vi.fn();
    handle.promise.then(exited);

    fake.emit("exit", 0, null);

    await new Promise((r) => setImmediate(r));
    expect(exited).toHaveBeenCalled();
  });

  it("rejects on spawn error", async () => {
    const fake = makeFakeChild();
    vi.mocked(spawn).mockReturnValue(fake as never);

    const handle = spawnHidden();
    const reject = vi.fn();
    handle.promise.catch(reject);

    fake.emit("error", new Error("spawn failed"));

    await new Promise((r) => setImmediate(r));
    expect(reject).toHaveBeenCalled();
  });

  it("kill() is no-op when child already exited", () => {
    const fake = makeFakeChild();
    fake.exitCode = 0;
    vi.mocked(spawn).mockReturnValue(fake as never);

    const handle = spawnHidden();
    handle.kill();

    expect(fake.kill).not.toHaveBeenCalled();
  });

  it.skipIf(process.platform !== "win32")(
    "kill() invokes taskkill /T /F on Windows",
    async () => {
      const fake = makeFakeChild(4242);
      vi.mocked(spawn).mockReturnValue(fake as never);

      const handle = spawnHidden();
      handle.kill();

      await new Promise((r) => setImmediate(r));
      const taskkill = vi.mocked(spawn).mock.calls[1];
      expect(taskkill).toBeDefined();
      const [cmd, args] = taskkill!;
      expect(cmd).toBe("taskkill");
      expect(args).toEqual(["/pid", "4242", "/T", "/F"]);
    }
  );

  it.skipIf(process.platform === "win32")(
    "kill() sends SIGTERM to process group on POSIX",
    () => {
      const fake = makeFakeChild(5555);
      vi.mocked(spawn).mockReturnValue(fake as never);
      const spy = vi.spyOn(process, "kill").mockImplementation(() => true);

      const handle = spawnHidden();
      handle.kill();

      expect(spy).toHaveBeenCalledWith(-5555, "SIGTERM");
    }
  );
});