# VS Code Playground + Mở code trong VS Code

Ngày: 2026-08-31
Nhánh: `feat/frontend-vscode-open`

## Bối cảnh

Cần nút để mở code giải trong VS Code với cursor đặt ngay tại dòng bắt đầu thân hàm.

## Thay đổi

### Server (apps/server)

- `src/config.ts` — thêm `PLAYGROUND_ROOT` (resolve đến `playground/` ở repo root).
- `src/services/playground.service.ts` — `saveToPlayground(slug, code)`: ghi `playground/<slug>.js`, `findFunctionBodyLine(code)`: state machine tìm dòng `{` đầu tiên của function (bỏ qua comment/string/template literal).
- `src/controllers/playground.controller.ts` — Zod validate params/body, gọi service.
- `src/routes/playground.routes.ts` — `POST /api/playground/:slug`.
- `src/routes/index.ts` — đăng ký playground route (prefix `/api`).

### Web (apps/web)

- `src/lib/api.ts` — thêm `saveToPlayground(slug, code)`.
- `src/components/ProblemDetail.tsx` — nút "VS Code" (icon từ `public/assets/vscode.svg`) trong header code, gọi API → mở `vscode://file/<path>:<line>:<column>`.
- VS Code button hiển thị cạnh nút Run.

### Khác

- `.gitignore` — thêm `playground/` (code người dùng, không commit).

## Kết quả

- `pnpm -r build` pass.
- Server 36 tests (thêm 6 tests cho `findFunctionBodyLine`), extension 49 tests pass.
- Endpoint test: `POST /api/playground/remove-nth-node-from-end-of-list` → `{"ok":true,"path":"...","line":13,"column":1}` (dòng 13 = body `removeNthFromEnd`).