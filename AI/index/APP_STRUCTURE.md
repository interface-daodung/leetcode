# Application Structure

## Applications

Có 3 ứng dụng trong monorepo:

1. **`@leetcode/web`** — React + Vite frontend (apps/web)
2. **`@leetcode/server`** — Fastify API server (apps/server)
3. **`@leetcode/extension`** — MV3 Browser Extension (apps/extension, vanilla JS, load unpacked)

## Application Entry Points

- Web: `apps/web/index.html` → `apps/web/src/main.tsx` → `App.tsx`
- Server: `apps/server/src/index.ts` (Fastify listen on port 3000, có CORS + hydrate)
- Extension: `apps/extension/manifest.json` → `content.js` + `style.css` (matches `*://leetcode.com/problems/*`)

## Frontend

- **Framework**: React 18.3, Vite 5, `@vitejs/plugin-react`, Tailwind CSS 4 (`@tailwindcss/vite`), React Router DOM 7.
- **Entry**: `index.html` → `main.tsx` (BrowserRouter + ThemeProvider) → `App.tsx` (Routes).
- **Routing**: Layout (`Header` + `Sidebar` + `<Outlet />`) → `/problems/:id` (ProblemDetail). `/` và `/problems` redirect về first problem.
- **Components**: `Layout.tsx`, `Header.tsx` (logo bấm để ẩn/hiện sidebar, theme toggle), `Sidebar.tsx` (list + search + filter theo difficulty), `ProblemDetail.tsx` (mô tả trái, editor + Run + nút VS Code phải, hints), `CodeEditor.tsx` (contentEditable div + react-syntax-highlighter, selection tự nhiên), `TestCaseTabs.tsx` (tabs hiển thị input/expected/actual từng test case), `DifficultyBadge.tsx`.
- **Theme**: CSS variables (`:root` light / `[data-theme=dark]`) trong `src/index.css`, `@custom-variant dark` cho Tailwind, `lib/theme.tsx` (ThemeProvider + useTheme, lưu localStorage).
- **Code highlighting**: `react-syntax-highlighter` (PrismLight, register javascript/typescript/python/css, theme `oneDark`/`oneLight` theo theme), render HTML string qua `renderToStaticMarkup`, contentEditable div hiển thị trực tiếp — không overlay nên không lệch dòng, selection nhìn thấy được.
- **Mở trong VS Code**: nút "VS Code" (icon `public/assets/vscode.svg`) gọi `POST /api/playground/:slug` → ghi `playground/<slug>.js` → mở `vscode://file/<path>:<line>:<column>` (line = dòng mở body hàm).
- **Icon app**: bản copy ảnh logo ở `public/assets/leetcodeLab.*` (`ico/png/webp`) — nguồn ảnh dùng chung đặt tại `packages/shared/asset/icon`. Không có logic riêng; web tham chiếu ảnh cục bộ.
- **API**: `lib/api.ts` — `fetchProblems` (GET /api/problems), `fetchProblem` (GET /api/problems/:id), `runCode` (POST /api/problems/:id/run), `saveToPlayground` (POST /api/playground/:slug). Host từ root `.env` (`VITE_API_URL`), fallback localhost.
- **Đã loại bỏ**: `ProblemImportPaste.tsx`, `lib/problemClip.ts` — web không còn nhập đề thủ công (extension POST thẳng tới server).
- **Dependencies**: `@leetcode/shared`, `@leetcode/editor`, `@leetcode/problem-engine`, `react-router-dom`, `react-syntax-highlighter`.
- **Chưa có**: Monaco Editor thật.

## Backend

- **Framework**: Fastify 4 với logger, CORS (`Access-Control-Allow-Origin: *`), hydrate DB khi khởi động.
- **Entry**: `apps/server/src/index.ts` (env + `createApp()` + hydrate + listen); `src/app.ts` đăng ký plugins/routes.
- **Kiến trúc**: MVC / phân tầng — `routes/` (path) → `controllers/` (Zod validate + trả response) → `services/` (logic nghiệp vụ) → `plugins/` (CORS, static) + `config.ts`.
- **Endpoints**:
  - `GET /health` — health check.
  - `GET /api/problems` — list tất cả problems (từ DB, kèm hints).
  - `GET /api/problems/:id` — lấy problem theo id (engine → fallback DB, kèm hints/assets).
  - `GET /api/problems/random/:difficulty?` — random problem.
  - `POST /api/problems/:id/run` — lọc comment → trích hàm giải duy nhất → wrap spread input → engine.runTestsDetailed (trả per-case results input/expected/actual/ok/error).
  - `POST /api/problems/:id/hint` — lấy hint (placeholder).
  - `GET /api/problems/:id/hints` — hints từ DB.
  - `GET /api/problems/:id/assets` — assets từ DB.
  - `POST /api/playground/:slug` — ghi `playground/<slug>.js` + trả line/column body hàm để mở VS Code (`services/playground.service.ts`).
  - `POST /api/problems/import` — import ProblemClip JSON (validate Zod, 201/409/400).
- **Validation**: Zod (parse params/body manually, không dùng Fastify schema).
- **Dependencies**: `@leetcode/shared`, `@leetcode/database`, `@leetcode/problem-engine`, `@leetcode/ai`.
- **Chưa có**: auth, middleware, error handler tập trung, WebSocket.

## Extension (Browser)

- **Type**: Manifest V3, content script TypeScript được bundle bằng **esbuild** (`src/index.ts` → `content.js`, IIFE, không minify).
- **Manifest**: `apps/extension/manifest.json` — `matches: *://leetcode.com/problems/*`, `permissions: clipboardWrite`, `web_accessible_resources` (assets ảnh + SVG), `host_permissions: *://leetcode.com/*`.
- **Cấu trúc component-based** (`src/`):
  - `shared.ts` — types (`Difficulty`, `TestCase`, `ProblemClip`), asset URLs (`chrome.runtime.getURL`), `API_BASE` (từ `LC_API_BASE`), `copyToClipboard`, DOM IDs.
  - `parsers/` — logic thuần DOM parsing (test jsdom): `title.ts` (parseTitle, extractSlug), `difficulty.ts` (normalizeDifficulty, extractDifficulty), `tags.ts` (extractTags), `description.ts` (findDescriptionContainer, findTitleAnchor, cleanDescription), `hints.ts` (extractHints), `template.ts` (extractTemplate + findCodeSnippetInJson), `testcases.ts` (extractTestCases — 4 nguồn: hidden cm-content → visible console → `__NEXT_DATA__` → description `<pre>`).
  - `clip.ts` — `buildProblemClip` (orchestrator) + `isValidProblemClip` + re-export parsers.
  - `widget/` — `create.ts` (tạo widget + img Idle), `drag.ts` (makeDraggable, keepInBounds), `state.ts` (setWidgetState 4 trạng thái, playSquashStretch).
  - `toast/` — `create.ts` (ensureToast), `svg.ts` (generateToastSvg — fetch template SVG, auto font-size 24-72px, wrap, tspan), `show.ts` (showToast, position top-right widget).
  - `api/` — `validate.ts` (isValidClipForPost), `post.ts` (postToServer — POST /import → 409 → PUT /:id ghi đè).
  - `index.ts` — entry: `handleClip` (orchestrator), `init`, SPA hook (setInterval theo dõi URL).
- **Build**: `tsc --noEmit && node scripts/bundle.mjs` (esbuild). `content.js` **không sửa tay** — được sinh từ `src/index.ts`.
- **Tests**: `src/clipper.test.ts` (53 tests jsdom) — import trực tiếp từ parsers/ và clip.ts.
- **Style**: `style.css` — widget ảnh 80px, `@keyframes squashStretch` 1.2s, toast SVG không shadow.

## Shared Components

Không có shared UI component. Các package chia sẻ logic và types:

- `packages/shared` — types (`ProblemMeta`, `ProblemClip`, `Difficulty`, `TestCase`), utils (`formatProblemId`), ảnh icon gốc (`asset/icon`).
- `packages/editor` — `EditorState`, `createEditorState`, `languageTemplates`.
- `packages/problem-engine` — `ProblemEngine` (registry + test runner, hydrate từ DB).
- `packages/database` — `ProblemDatabase` (SQLite CRUD).
- `packages/ai` — `getHint`, `explainSolution` (placeholder).
- `packages/javascript-docs` — `jsDocs`, `getDoc` (static).

## Important Paths

| Path | Purpose |
|------|---------|
| `apps/web/src/main.tsx` | React DOM mount + BrowserRouter + ThemeProvider |
| `apps/web/src/App.tsx` | Routes (Layout → /problems/:id) |
| `apps/web/src/components/Layout.tsx` | Header + Sidebar + Outlet layout |
| `apps/web/src/components/Header.tsx` | Logo, nav, theme toggle |
| `apps/web/src/components/Sidebar.tsx` | Problem list (search, filter) |
| `apps/web/src/components/ProblemDetail.tsx` | Full problem view (description, hints, editor, run) |
| `apps/web/src/components/CodeEditor.tsx` | Code input + syntax highlighting |
| `apps/web/src/lib/api.ts` | API client (list, detail, run) |
| `apps/web/src/lib/theme.tsx` | ThemeProvider (light/dark, localStorage) |
| `apps/web/src/lib/sanitize.ts` | Sanitize HTML trước dangerouslySetInnerHTML |
| `apps/web/src/index.css` | Tailwind + CSS variables theme |
| `apps/server/src/index.ts` | Entry: env + createApp + hydrate + listen |
| `apps/server/src/app.ts` | createApp(): Fastify instance + plugins + routes |
| `apps/server/src/routes/` | Khai báo path (health, problems) |
| `apps/server/src/controllers/` | Zod validate + trả response |
| `apps/server/src/services/` | Logic nghiệp vụ (problem.service, asset.service) |
| `apps/extension/manifest.json` | MV3 manifest |
| `apps/extension/content.js` | Content script — **sinh từ esbuild**, không sửa tay |
| `apps/extension/src/index.ts` | Entry: handleClip + init + SPA hook |
| `apps/extension/src/parsers/` | Pure extraction logic (testable, 53 tests) |
| `apps/extension/src/clip.ts` | buildProblemClip + isValidProblemClip |
| `apps/extension/src/widget/` | Widget UI (create, drag, state) |
| `apps/extension/src/toast/` | Toast SVG (create, svg, show) |
| `apps/extension/src/api/` | API client (validate, post) |
| `apps/extension/scripts/bundle.mjs` | esbuild bundle src/index.ts → content.js |
| `packages/shared/src/index.ts` | Types và utils (có ProblemClip) |
| `packages/editor/src/index.ts` | Editor state |
| `packages/problem-engine/src/index.ts` | ProblemEngine class |
| `packages/ai/src/index.ts` | AI hint placeholder |