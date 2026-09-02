# Project Status

Cập nhật: 2026-09-01

## Current Phase

**[mới 2026-09-02] Tab AI hướng dẫn giải qua WebSocket** — nhánh `feat/ai-panel-websocket`. Thêm panel **AI** vào dockable layout (tabset-output): tab có nút "Sinh hướng dẫn giải", gửi thông tin bài toán (title/slug/difficulty/tags/description/template/hints) qua **WebSocket** `/ws/ai` (`@fastify/websocket@^10` — v11 cần Fastify 5, dự án đang dùng Fastify 4) đến server. Server giữ prompt/template trong `packages/ai` (`generateGuide`) — **không lộ ra client**, trả JSON `AIGuide` gồm 5 section (approach/algorithm/solution/complexity/edge-cases), mỗi section có content + `explanation` (giải thích từng phần). Panel có nút **"Giải thích (AI)"** hiện explanation cục bộ, và nút **"ChatGPT ↗"** mở `chatgpt.com/?q=<encodeURIComponent(prompt)>` với prompt điền sẵn tham chiếu URL bài toán (`buildChatGptUrl`), vì model AI cục bộ nhỏ khó giải thích bài lớn. Smoke test end-to-end: `ws://localhost:3997/ws/ai` gửi `{type:"guide",problem:{...}}` → nhận `{type:"guide",guide:{...}}` đủ 5 section. `LayoutComponentName` thêm `ai`, `defaultTabsetId("ai")` → tabset-output. `pnpm -r build` + `pnpm -r test` pass (layout 10, ai 4, server 39, ...). Xem `AI/history/2026-09/ai-panel-websocket.md`.

**[mới 2026-09-01] Tách Knowledge panel thành Knowledge Search + Knowledge Result** — nhánh `feat/knowledge-split-panels`. Panel Knowledge cũ gộp search + detail trong 1 tab (vùng hiển thị detail bị nén `max-h-[45%]`). Tách thành 2 panel: `KnowledgeSearchPanel` (ô search + EN/VI + category chips + danh sách kết quả, tabset-output) và `KnowledgeResultPanel` (chi tiết section đầy đủ, tabset riêng `tabset-knowledge-result` cạnh Output). State search chia sẻ qua `KnowledgeContext.tsx` (query debounce, lang, category, results, selectedId). Bấm kết quả search → `focusPanelTab("knowledge-result")` tự mở/focus tab Result. `LayoutComponentName` thêm `knowledge-search`/`knowledge-result`, giữ `knowledge` legacy; `migrateLayoutJson` trong `WorkspaceContext` tự đổi tab `knowledge` cũ trong localStorage → `knowledge-search` + chèn tabset result cạnh tabset-output. `pnpm -r build` pass, 137 tests pass (layout 10, server 36, extension 53, editor 11, engine 10, docs 22... ).

**[mới 2026-08-31] GitNexus + archive tài liệu tĩnh** — cài GitNexus (v1.6.10, index 2.353 symbols / 3.718 edges / 56 clusters / 88 flows, MCP cấu hình trong OpenCode). Archive `AI/index/`, `AI/ARCHITECTURE.md`, `AI/walkthrough/` sang `AI/history/archived/` và xóa `CLAUDE.md`/`.claude/` để agent không đọc lãng phí token; từ nay hiểu codebase bằng GitNexus (`query`/`context`/`impact`) thay vì tài liệu tĩnh. Cập nhật `AGENTS.md`, `AI/INDEX.md`, `AI/README.md`, các skills, decision + history. Xem `AI/history/2026-08/archive-index-architecture-walkthrough.md`.

**[mới 2026-08-31] Dockable Layout (IDE-like) + Package State/Tree Redesign** — nhánh `feat/dockable-layout`. Biến `apps/web` thành giao diện IDE-like dockable layout bằng **FlexLayout** (`flexlayout-react`), đồng thời tái thiết kế `packages/editor` và `packages/problem-engine` sang **state/tree model**. Xem `AI/history/2026-08/dockable-layout-package-state-tree.md`.

Thay đổi chính:
- **Package mới `@leetcode/layout`** — wrap FlexLayout (Model/Actions/theme + default tree `row → tabset → tab`), 6 tests.
- **`packages/editor`** — thêm `EditorTreeState` (cây file: root/group/file + pure ops open/update/close/setActive/find/toFlatFiles), 11 tests.
- **`packages/problem-engine`** — thêm `ProblemTreeState` (byDifficulty/byTag/byId + search/list), tích hợp vào `ProblemEngine` giữ nguyên API cũ (server 36 tests + extension 53 tests vẫn pass), 10 tests.
- **`apps/web`** — FlexLayout dockable layout thay thế 2 cột cứng: 4 panels (Explorer/Editor/Description/Output), kéo thả tab + resize + persist localStorage (`lc:layout:json`) + theme đồng bộ.
- **Docs** — cập nhật ARCHITECTURE, PACKAGE_STRUCTURE, walkthrough frontend, docs/features.
- `pnpm -r build` + `pnpm -r test` pass (137 tests).

## Current Phase

**[mới 2026-08-31] Mở khóa AI tự chủ git cục bộ** — cập nhật quy tắc làm việc: `AGENTS.md` thay quy định "Không tự commit/merge/push trừ khi được yêu cầu" bằng **Git Workflow (tự chủ cục bộ)**: AI tự commit thường xuyên sau mỗi phần việc, tự tạo nhánh `feat/<name>`/`fix/<name>` khi bắt đầu tính năng mới/triển khai kế hoạch, được merge nội bộ giữa các nhánh cục bộ — **nhưng tuyệt đối không push/publish/PR** (remote chỉ do user chủ động). Đồng bộ vào `AI/CONVENTIONS.md` (mục Git Workflow), `AI/skills/feature-development/SKILL.md` (thêm bước tạo nhánh + commit), ghi decision mới trong `AI/context/decisions.md`.

**[mới 2026-08-31] Extension component-based refactor + esbuild** — tách `clipper.ts` (907 dòng) + `content.js` (1093 dòng) thành `src/parsers/` (7 file thuần), `src/clip.ts` (orchestrator), `src/widget/`, `src/toast/`, `src/api/`, `src/index.ts` (entry). Thêm esbuild bundle `src/index.ts` → `content.js` (IIFE) — **content.js không còn sửa tay**. 53 tests pass, `pnpm -r build` pass. Xem `AI/history/2026-08/extension-component-based-refactor.md`.

**[mới 2026-08-31] Widget ảnh động + Toast SVG + Backend ghi đè** — nhánh `feat/widget-animated-images`. Widget thay text "LC" bằng 4 ảnh PNG (`Idle.png`/`Loading.png`/`Success.png`/`Error.png`) qua `chrome.runtime.getURL`. Thêm `@keyframes squashStretch` 1.2s animation khi click. Toast dùng `assets/toast-text.svg` render text động (auto font-size 24-72px, auto wrap, lệch trái/lên). Backend thêm `PUT /api/problems/:id` để ghi đè, CORS thêm PUT. Extension tự retry PUT khi 409. `pnpm -r build` pass, server 36 tests + extension 53 tests pass.

**[mới 2026-08-31] Shared icon assets** — thêm `packages/shared/asset/icon/` lưu file ảnh icon `leetcodeLab.{ico,png,webp}` (nguồn dùng chung), và bản copy ảnh cần thiết vào asset riêng từng app: `apps/web/public/assets/leetcodeLab.*` (web) và `apps/extension/assets/leetcodeLab.*` (extension). **Không thêm logic/helper TS** — chỉ đặt file ảnh, các app tự tham chiếu ảnh cục bộ của mình. `pnpm -r build` pass.

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
 - **[mới 2026-08-31] Fix extension template nhiễm + thiếu testCases** — `apps/extension` clip `1091. Shortest Path in Binary Matrix` bị lấy nhầm `shipWithinDays` và `testCases` rỗng. Nguyên nhân: `window.monaco.getModels()[0]` lấy model cũ nhất (SPA không reload) trước `code_editor` DOM; `extractTestCases` chỉ dựa hidden `cm-content`/`__NEXT_DATA__.testCases` bỏ qua `exampleTestcases` string và `description <pre>`. Fix: đổi thứ tự `extractTemplate` thành `code_editor` → `__NEXT_DATA__` → `view-lines` → `window.monaco` (duyệt ngược + lọc javascript + regex); mở rộng `extractTestCases` thêm selector `opacity-0/h-0`, parser `exampleTestcases` string và fallback `extractTestCasesFromDescription` (regex `Input/Output` trong `<pre>` → `{grid: [...]}` → `2/4/-1`). Đồng bộ `content.js`. Thêm 4 tests regression → extension 53 tests pass. Nhánh `fix/extension-template-testcases`, xem `AI/history/2026-08/extension-clip-template-testcases-fix.md`.

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
