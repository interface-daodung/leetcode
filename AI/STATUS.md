# Project Status

Cập nhật: 2026-08-30

## Current Phase

Giai đoạn implement — feature **LeetCode Clipper (Browser Extension Widget)** đã hoàn thành code, test, build.

- Nhánh: `feat/leetcode-clipper-extension`
- Plan: `AI/plans/active/leetcode-clipper-extension.md` (chuẩn bị move sang completed)
- Kết quả: extension clip DOM → clipboard, web paste → preview → `POST /api/problems/import` → SQLite, 28 tests pass, `pnpm -r build` pass.

## Đã hoàn thành

- Khởi tạo pnpm workspace monorepo.
- Tạo `apps/web` (React + Vite, chạy code cục bộ).
- Tạo `apps/server` (Fastify + Zod, API problems/hints).
- Tạo `packages/shared` (types + utils).
- Tạo `packages/database` (Drizzle ORM + SQLite, schema `problems` + migration 0000).
- Tạo `packages/editor` (editor state + language templates).
- Tạo `packages/problem-engine` (in-memory registry + test runner).
- Tạo `packages/ai` (placeholder hints).
- Tạo `packages/javascript-docs` (placeholder static docs).
- DB path cố định tại `packages/database/data/leetcode.db`, auto-migrate runtime.
- Tất cả package nội bộ đồng bộ ESM (`"type": "module"`).
- Seed script đã bị bỏ khỏi dự án.
- **[mới] LeetCode Clipper Extension** — `apps/extension` (MV3: `manifest.json`, `content.js` widget LC draggable, `style.css`, `src/clipper.ts` pure logic, 28 tests với jsdom, `vitest.config.ts`).
- **[mới] Shared `ProblemClip` type** — `packages/shared/src/index.ts` (id, slug, title, difficulty, tags, description, url, clippedAt).
- **[mới] Server API** — `GET /api/problems`, `GET /api/problems/:id` (fallback DB), `POST /api/problems/import` (Zod, 201/409/400), CORS, hydrate engine từ SQLite khi khởi động.
- **[mới] Web Import UI** — `apps/web/src/components/ProblemImportPaste.tsx` + `lib/problemClip.ts` (parse, sanitize), `App.tsx` tích hợp list `GET /api/problems`.
- **[mới] Sửa BOM** — xoá BOM trong `packages/{shared,editor,ai,javascript-docs}/package.json`; tạo `tsconfig.json` cho các package thiếu; `vitest --passWithNoTests` cho `pnpm -r test`.
- **[mới] Docs** — cập nhật `AI/ARCHITECTURE.md`, `AI/index/*`, `AI/context/decisions.md`.

## Đang làm

- Chuẩn bị move plan `leetcode-clipper-extension` sang `AI/plans/completed/` và ghi history.

## Tiếp theo

- [ ] Move plan: chạy `AI\skills\feature-development\move-plan-to-completed.bat leetcode-clipper-extension` từ repo root.
- [ ] Test thủ công end-to-end: load unpacked `apps/extension` → mở `leetcode.com/problems/two-sum` → click LC → paste vào `localhost:5173` → Save → check `GET /api/problems/:id` và DB.
- [ ] (tùy chọn) Thêm `testCases` parsing từ Example, thêm `slug`/`url` vào DB schema, publish extension.

Roadmap chung (README `Next Steps`, chưa chốt):

- [ ] Thêm Prisma + SQLite cho problem persistence (ghi chú: hiện dùng Drizzle, cần thống nhất ORM).
- [ ] Tích hợp Monaco Editor trong web app.
- [ ] Thêm WebSocket cho real-time code execution.
- [ ] Implement AI hint streaming với Vercel AI SDK.
- [x] Build problem import từ LeetCode API — đã thay bằng DOM clip ở feature này.
- [ ] Thêm progress tracking và spaced repetition.

> Plan đã chốt: xem `AI/plans/active/` (sắp move sang completed).

## Known Issues

Xem:

`context/known-issues.md`

## Ghi chú

File này phải được cập nhật khi project có thay đổi lớn.
