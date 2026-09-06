# Plan: `feat/tray-spawn` — Package spawn `pnpm preview` ẩn console

## Bối cảnh

User muốn chạy `pnpm preview` ở chế độ nền trên Windows mà **không hiện cửa sổ CMD**. Tham khảo code C# WinForms (`PnpmTray`) nhưng repo là pnpm monorepo Node/TS — không thêm .NET. Mục tiêu thực sự (sau khi hỏi):

- Wrapper Node dùng `child_process.spawn` chạy `pnpm.cmd preview` với `windowsHide: true` + `stdio: "ignore"`.
- Không cần log UI, không cần tray icon OS, không cần ring buffer.
- Dùng lại script `pnpm preview` đã khai báo ở root `package.json:12`.
- Không thay đổi hành vi `pnpm preview` hiện tại — chỉ là cách gọi khác.

## YAGNI — không làm

- Không tray icon / System Tray (cần native binding Windows, ngoài phạm vi).
- Không log UI/ring buffer (user không đọc log; chỉ ẩn console).
- Không event emitter phức tạp, không auto-restart, không graceful shutdown signal (ngoài yêu cầu).
- Không đổi `pnpm preview` ở root.

## Phạm vi

### Tạo `packages/tray-spawn/`

ESM package Node, `name: "@leetcode/tray-spawn"`, phụ thuộc duy nhất stdlib (`node:child_process`, `node:process`). Không thêm dependency mới.

### API export (qua `src/index.ts`)

```ts
export interface SpawnOpts {
  cwd?: string;            // mặc định process.cwd()
  env?: NodeJS.ProcessEnv; // merge vào env hiện tại
  command?: string;        // mặc định "pnpm preview"
}

export interface SpawnedHandle {
  pid: number | undefined;
  kill: () => void;        // kill cả process tree (Windows: taskkill /T /F)
  promise: Promise<void>;  // resolve khi process exit
}

export function spawnHidden(opts?: SpawnOpts): SpawnedHandle;
```

**Quyết định kỹ thuật:**

1. `child_process.spawn(command, { shell: true, windowsHide: true, stdio: "ignore", detached: false, cwd, env: { ...process.env, ...opts.env } })` — `shell: true` để Node tự resolve `pnpm.cmd` trên Windows (PATHEXT), `windowsHide: true` ẩn CMD window.
2. `stdio: "ignore"` — stdout/stderr vứt luôn, không buffer, không tốn memory. Đúng yêu cầu user.
3. `kill()` dùng `taskkill /pid <pid> /T /F` trên Windows (kill cả cây: pnpm → concurrently → node → vite), fallback `process.kill(pid, "SIGTERM")` trên POSIX.
4. `promise` resolve khi `exit` event; reject nếu spawn throw.
5. CLI script (`src/cli.ts`): `node packages/tray-spawn/src/cli.ts` → gọi `spawnHidden()`, log `PID: xxx`, đợi `Ctrl+C` → `handle.kill()`.

### Root scripts

Thêm ở `package.json`:

```json
"preview:hidden": "node packages/tray-spawn/src/cli.ts"
```

Không đổi `preview` hiện tại.

## Files thay đổi

| File | Thay đổi |
|---|---|
| `packages/tray-spawn/package.json` | Tạo mới |
| `packages/tray-spawn/tsconfig.json` | Tạo mới (giống `packages/ai/tsconfig.json`) |
| `packages/tray-spawn/src/index.ts` | Tạo mới — export `spawnHidden` |
| `packages/tray-spawn/src/cli.ts` | Tạo mới — entry point thực thi |
| `packages/tray-spawn/src/spawn.test.ts` | Tạo mới — test spawn + kill |
| `packages/tray-spawn/eslint.config.js` | Tạo mới (flat config giống package khác nếu có) |
| `package.json` | Thêm `preview:hidden` script |

## Test

`packages/tray-spawn/src/spawn.test.ts` (Vitest, mock child_process):

1. `spawnHidden()` gọi `spawn` đúng 1 lần với option `windowsHide: true`, `stdio: "ignore"`.
2. `spawnHidden()` truyền `cwd` đúng.
3. `kill()` gọi `taskkill /T /F` trên Windows, `process.kill` trên POSIX (skip test nếu không phải Win).
4. `promise` resolve khi child exit.

Skip test trên CI non-Windows nếu cần (`process.platform === 'win32'` guard).

## Acceptance

- `pnpm --filter=@leetcode/tray-spawn build` pass.
- `pnpm --filter=@leetcode/tray-spawn test` pass.
- Chạy `pnpm preview:hidden` trên Windows → không hiện CMD window, server chạy nền. Ctrl+C → kill sạch cây process.

## Sau khi xong

- Commit trên nhánh `feat/tray-spawn` (đã tạo).
- Move plan sang `AI/plans/completed/`.
- Cập nhật `AI/STATUS.md` + `AI/history/2026-09/tray-spawn.md`.