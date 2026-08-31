# Project Status

Cập nhật: 2026-08-31

## Current Phase

**[mới 2026-08-31] Frontend nâng cấp — nhánh `feat/frontend-vscode-open`** — các cải tiến frontend tách sang nhánh riêng. Thêm nút **"VS Code"** trong header code editor (icon `public/assets/vscode.svg`): gọi `POST /api/playground/:slug` → server ghi `playground/<slug>.js` + tìm dòng mở body hàm (`playground.service.findFunctionBodyLine`) → web mở `vscode://file/<path>:<line>:<column>`. Thêm **khung tabs test case** dưới code (`TestCaseTabs`): mỗi tab hiển thị Input/Expected/Actual + badge đúng/sai + tổng `passed/total`, dữ liệu từ `engine.runTestsDetailed` (per-case results). Thêm `playground/` vào `.gitignore`. Trước đó (cùng nhánh gốc): CodeEditor contentEditable + highlight trực tiếp, Header bấm logo ẩn/hiện sidebar, server `run` lọc comment → trích hàm → wrapSolution, fix ảnh assets 404. `pnpm -r build` pass, server 36 tests + extension 49 tests pass.

## Đang làm

- [ ] Hoàn thiện plan `AI/plans/active/frontend-redesign-tailwind-router.md` → move sang completed.
- [ ] (từ nhánh cũ) Hoàn thiện docs/history cho mở rộng DB hints/template/assets, cleanup test data (9999/9998) và chuẩn bị commit trên nhánh `feat/leetcode-widget-extension`.
- [ ] Hoàn thiện plan `AI/plans/active/server-mvc-restructure.md` → move sang completed.

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
- **[mới] LeetCode Widget Extension (base)** — `apps/extension` (MV3: `manifest.json`, `content.js` widget LC draggable, `style.css`, `src/clipper.ts` pure logic, `vitest.config.ts`).
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
- **[mới] DB migration + hints/template/assets DB (2026-08-30 tiếp tục cùng nhánh)**:
  - DB: `packages/database/src/schema.ts` thêm `slug`/`url`/`template` vào `problems`, bỏ `solution`, tạo `problem_assets` (id, problem_id FK cascade, original_url, local_path, hash + index) và `hints` (id, problem_id FK, ord, content). Migration `0001_add_url_template_hints_assets.sql` + update `0000_init.sql` dùng `text` thay `NVARCHAR(MAX)` để fix `SQLITE_ERROR near "MAX"`, update `meta/_journal.json` + `0001_snapshot.json`. Xóa `packages/database/data/assets/.hash-index.json` (chuyển sang DB).
  - DB layer: `ProblemDatabase` thêm `getAllWithHints`, `getHints/setHints`, `addAsset/findAssetByHash/findAssetsByProblem`, `updateDescription/update`, `ProblemMeta`/`ProblemClip` thêm `slug`/`url`/`template`/`hints`, bỏ `solution`.
  - Server: `src/assets.ts` viết lại dùng DB dedupe (check `findAssetByHash` → reuse `localPath` → `addAsset` per-problem, `ensureDir`, `writeFile`), `src/index.ts` thay đổi import flow (tạo problem trước để FK hợp lệ → `downloadAndRewriteImages` với `problemId` → `updateDescription`), thêm `GET /api/problems/:id/hints` và `/assets`, hydrate `getAllWithHints`, trả `assets`/`hints` trong `GET /:id` và `POST /import`.
  - Extension: `src/clipper.ts` thêm `extractHints` (parse `div.flex.flex-col` + `Hint N` + `HTMLContent_html__*`/`overflow-hidden`) và `extractTemplate` (monaco `.view-line` → join, fallback `CodeMirror`/`.monaco-editor`), `buildProblemClip` trả `url`/`template`/`hints`, `isValidProblemClip` check thêm, `content.js` đồng bộ; thêm 7 tests mới (hints 3, template 2, build với hints/template) → 42 tests pass.
  - Web: `lib/problemClip.ts` parse thêm `template`/`hints`/`url`, `ProblemImportPaste.tsx` hiển thị preview `url`, `template` (pre) và `hints` (list HTML), `App.tsx` không đổi.
  - Đã test end-to-end (fresh DB): `POST 9999` với `url`/`template`/3 hints + `https://httpbin.org/image/png` → `201` với `assets` 1 row (`test-new-features/png.png` hash `541a...`), `GET /9999` trả `hints`/`assets`/`template`/`url`, dedupe `POST 9998` cùng ảnh reuse `localPath` `test-new-features/png.png` (không tạo file mới, cùng hash), `GET /api/problems` list 5 với hints.
- **[mới] Docs** — cập nhật `AI/ARCHITECTURE.md` (DB 3 bảng, runtime/data flow mới, assets DB, hints/template), `AI/STATUS.md`, `context/decisions.md`, tạo `AI/history/2026-08/leetcode-clipper-db-hints-template-assets.md`.
- **[mới] Fix `created_at`** — `packages/database/src/schema.ts:14` đổi `default("(datetime('now'))")` → `default(sql\`(datetime('now'))\`)` (đã áp dụng trong commit `fa9c962`), verify DB lưu datetime thật. Backlog: `AI/plans/completed/fix-created-at-default.md`.
- **[mới 2026-08-31] Server refactor sang MVC / phân tầng** — `apps/server` chuyển từ single-file (`index.ts` 251 dòng) sang `routes/` → `controllers/` → `services/` → `plugins/` + `config.ts` + `app.ts`. Thêm `problem.service.test.ts` (6 tests) → server 11 tests pass, `pnpm -r build` pass, smoke-test ok. Xem `AI/history/2026-08/server-mvc-refactor.md`.
- **[mới 2026-08-31] Frontend redesign** — `apps/web` dùng Tailwind CSS 4 (`@tailwindcss/vite`), React Router DOM 7 (`/problems/:id`), `react-syntax-highlighter` (PrismLight oneDark/oneLight). Theme bằng CSS variables (`:root` / `[data-theme=dark]`) + `@custom-variant dark`, toggle trong Header lưu localStorage. Sidebar có search + filter difficulty. Đã xóa `ProblemImportPaste.tsx`/`lib/problemClip.ts` (không còn nhập tay). `pnpm -r build` pass, server 11 tests pass. Xem `AI/history/2026-08/frontend-redesign-tailwind-router.md`.
- **[mới 2026-08-31] Cải tiến editor + run test + assets** — `apps/web` CodeEditor chuyển sang **contentEditable div + react-syntax-highlighter** (render HTML string qua `renderToStaticMarkup`, giữ caret bằng tree-walker) → hết lệch dòng, selection nhìn thấy; Header bấm logo để ẩn/hiện sidebar (bỏ nút ◁/▷); ProblemDetail 2 cột (description trái, editor + Run phải). Server `run` dùng `services/solution.util.ts` (stripComments → extractSolutionFunction → wrapSolution) thay `new Function("return " + code)` — chạy được template có comment + function declaration/expression/arrow; thêm 19 tests → server 30 tests. Fix ảnh 404 bằng bỏ `wildcard: false` trong `@fastify/static` + `ensureAssetFiles` (tải lại file thiếu lúc hydrate/getById). Xem `AI/history/2026-08/code-editor-run-test-assets.md`.

## Đang làm

- [ ] (từ nhánh cũ) Hoàn thiện docs/history cho mở rộng DB hints/template/assets, cleanup test data (9999/9998) và chuẩn bị commit trên nhánh `feat/leetcode-widget-extension`.

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
