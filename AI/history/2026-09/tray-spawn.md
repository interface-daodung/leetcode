# tray-spawn — package Node spawn `pnpm preview` ẩn console

**Ngày**: 2026-09-06 · **Nhánh**: `feat/tray-spawn`

## Bối cảnh

User muốn chạy `pnpm preview` ở chế độ nền trên Windows, ẩn cửa sổ CMD. Tham khảo code C# WinForms (`PnpmTray`) — nhưng repo là pnpm monorepo Node/TS, không thêm .NET.

## Quyết định

- Wrapper Node ESM, stdlib only (`node:child_process`, `node:process`).
- `spawnHidden()` trả về `{ pid, kill, promise }`. `kill()` dùng `taskkill /T /F` trên Windows để kill cả cây.
- `stdio: "ignore"` — stdout/stderr vứt luôn, không buffer (đúng yêu cầu "không cần đọc log").
- `windowsHide: true` + `shell: true` để Node tự resolve `pnpm.cmd` qua PATHEXT.
- Không làm: tray icon OS, log UI, ring buffer, auto-restart (YAGNI).

## Files

| File | Vai trò |
|---|---|
| `packages/tray-spawn/package.json` | Deps: `tsx` (dev), `@types/node` |
| `packages/tray-spawn/tsconfig.json` | NodeNext, ES2022, strict |
| `packages/tray-spawn/src/index.ts` | API: `spawnHidden()` + types |
| `packages/tray-spawn/src/cli.ts` | Entry thực thi, handle SIGINT/SIGTERM |
| `packages/tray-spawn/src/kill.ts` | `pnpm preview:kill` — tìm pnpm.cmd qua tasklist, kill sạch |
| `packages/tray-spawn/src/spawn.test.ts` | 7 tests pass (1 skip POSIX), mock child_process |
| `package.json` | Thêm scripts `preview:hidden`, `preview:kill` |
| `AI/plans/active→completed/tray-spawn.md` | Plan |

## Root scripts

```jsonc
"preview:hidden": "pnpm --filter=@leetcode/tray-spawn exec tsx src/cli.ts",
"preview:kill":   "pnpm --filter=@leetcode/tray-spawn exec tsx src/kill.ts"
```

## Test kết quả

- `pnpm --filter=@leetcode/tray-spawn build` pass
- `pnpm --filter=@leetcode/tray-spawn test` — 7 passed, 1 skipped
- Smoke E2E trên Windows: spawn `cmd /c timeout /t 30` qua wrapper → kill sau 1.5s → done, Task Manager sạch.
- `pnpm preview:kill` chạy, tìm `pnpm.cmd` qua `tasklist /FI "IMAGENAME eq pnpm.cmd"` → kill.

## Lưu ý

- `pnpm preview` script trong root `package.json` đã bị xóa trước đó — package này sẵn sàng nhưng root cần thêm lại script `preview` để `pnpm preview:hidden` chạy thật.
- `packages/tray-spawn` đứng riêng (không phụ thuộc package khác trong monorepo) — tuân thủ luật phân tầng: domain logic OS-level, không lẫn API server, không lẫn React.
- Lint fail do thiếu `eslint.config.*` — đã có sẵn ở `packages/shared` + `apps/extension`, không phải do package này.

---

## Fix build chain (commit thứ 4)

Vấn đề phát hiện khi smoke: `pnpm start:hidden` chạy web OK nhưng server fail vì `apps/server/dist/index.js` resolve `@leetcode/database` qua workspace → `packages/database/src/index.ts` (TS) → Node load thất bại.

Nguyên nhân gốc: 4 package (`shared`, `ai`, `database`, `problem-engine`) đều `build: tsc --noEmit` → không emit `.js`. Khi runtime resolve qua `package.json#main` trỏ về `src/index.ts`, Node không load được.

### Thay đổi

| File | Trước | Sau |
|---|---|---|
| `packages/{shared,ai,database,problem-engine}/package.json` | `build: tsc --noEmit`, `main: src/index.ts` | `build: tsc`, `main: dist/index.js` |
| `packages/{shared,ai,database,problem-engine}/tsconfig.json` | `noEmit: true`, không có `outDir` | bỏ `noEmit`, thêm `outDir: "dist"`, `declaration: true`, `declarationMap: true`, `sourceMap: true` |

`apps/server` không cần đổi (đã có `start: node dist/index.js`).

### Kết quả

- `pnpm -r build` pass — 4 package emit `.js` + `.d.ts` ra `dist/`.
- `pnpm -r test` pass — 13 test files, ~150 tests.
- E2E `pnpm start:hidden`: server `:3000` `GET /api/problems` trả **200** (10 problems từ SQLite), web `:4173` trả **200**.