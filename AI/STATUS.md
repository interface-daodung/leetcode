# Project Status

Cập nhật: 2026-08-30

## Current Phase

Giai đoạn implement — feature **LeetCode Clipper (Browser Extension Widget)** đã hoàn thành và mở rộng **direct import + assets** trên cùng nhánh.

- Nhánh: `feat/leetcode-clipper-extension`
- Plan gốc: `AI/plans/completed/leetcode-clipper-extension.md` (đã move từ active)
- Mở rộng (chưa có plan riêng): direct POST từ extension tới server (host từ root `.env`), tải ảnh trong description về `packages/database/data/assets/<slug>/` với dedupe SHA-256, serve `GET /assets/*`, validate chặt, hiển thị list từ DB.
- Kết quả: extension clip DOM → POST trực tiếp `http://localhost:3000/api/problems/import` (fallback clipboard), web `GET /api/problems` hiển thị list, server tải ảnh và lưu assets, 35 tests extension + 5 tests server assets pass, `pnpm -r build` pass.

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
- **[mới] LeetCode Clipper Extension (base)** — `apps/extension` (MV3: `manifest.json`, `content.js` widget LC draggable, `style.css`, `src/clipper.ts` pure logic, `vitest.config.ts`).
  - `src/clipper.ts` có `extractTags` (a[href^="/tag/"]) — đã fix để tags không còn rỗng (VD `debai.html` → 4 tags).
  - 35 tests với jsdom (`clipper.test.ts`).
- **[mới] Shared `ProblemClip` type** — `packages/shared/src/index.ts` (id, slug, title, difficulty, tags, description, url, clippedAt).
- **[mới] Server API (base)** — `GET /api/problems`, `GET /api/problems/:id` (fallback DB), `POST /api/problems/import` (Zod, 201/409/400), CORS, hydrate engine từ SQLite khi khởi động.
- **[mới] Web Import UI (base)** — `apps/web/src/components/ProblemImportPaste.tsx` + `lib/problemClip.ts` (parse, sanitize), `App.tsx` tích hợp list `GET /api/problems`.
- **[mới] Sửa BOM** — xoá BOM trong `packages/{shared,editor,ai,javascript-docs}/package.json`; tạo `tsconfig.json` cho các package thiếu; `vitest --passWithNoTests` cho `pnpm -r test`.
- **[mới] Direct import + Env + Assets (2026-08-30 mở rộng trên cùng nhánh)**:
  - Root `.env` + `.env.example` (PORT/HOST/API_URL/VITE_API_URL/EXTENSION_API_URL) — một chỗ sửa cho toàn monorepo (`.gitignore` thêm `.env` và `assets/`).
  - Server: `dotenv` đọc root `.env`, `API_URL`/`PORT`/`HOST` từ env, `@fastify/static` serve `GET /assets/*` từ `packages/database/data/assets`, `src/assets.ts` (`downloadAndRewriteImages`: HTTP Response → Buffer → SHA-256 → check `.hash-index.json` → ghi `assets/<slug>/{name}` + rewrite description src thành `${API_URL}/assets/...`), validation Zod strict (null check), 5 tests `src/assets.test.ts`.
  - Extension: `api-config.js` (auto-gen từ root `.env` via `scripts/sync-api-url.mjs` + `prebuild`), `manifest.json` thêm `api-config.js` trước `content.js` và `host_permissions` localhost + API host, `content.js` thêm `API_BASE` từ `LC_API_BASE`, `isValidClipForPost`, `postToServer` (fetch POST trực tiếp, toast 201/409/error) + vẫn copy clipboard.
  - Web: `vite.config.ts` `envDir=root`, `App.tsx` và `ProblemImportPaste.tsx` dùng `import.meta.env.VITE_API_URL ?? "http://localhost:3000"`, list đọc từ DB hiển thị ngay sau import.
  - Đã test end-to-end local: `POST /api/problems/import` với `<img src="https://httpbin.org/image/png">` → rewrite thành `http://localhost:3000/assets/test-img2/png.png`, dedupe cùng hash giữa 2 problem khác slug.
- **[mới] Docs** — cập nhật `AI/ARCHITECTURE.md` (3 apps + runtime/data flow mới, assets, env), `AI/STATUS.md`, `packages/database` assets handling.

## Đang làm

- Hoàn thiện docs/history cho mở rộng direct import + assets, chuẩn bị commit trên nhánh `feat/leetcode-clipper-extension`.

## Tiếp theo

- [ ] (tuỳ chọn) Tạo plan riêng cho mở rộng direct import + assets và move sang completed, hoặc gộp vào plan cũ.
- [ ] Test thủ công end-to-end với extension unpacked: `pnpm --filter=@leetcode/extension sync:config` → Load unpacked `apps/extension` → mở `leetcode.com/problems/two-sum` (có ảnh) → click LC → check toast "Đã lưu" → check `http://localhost:3000/api/problems` và `http://localhost:5173` list → check `packages/database/data/assets/<slug>/` và `GET http://localhost:3000/assets/<slug>/{name}`.
- [ ] Dọn `tham_khao/` (untracked) trước khi PR, và cân nhắc `pnpm -r lint`.
- [ ] (tùy chọn) Thêm `testCases` parsing từ Example, publish extension.

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
