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

- **Type**: Manifest V3, content script vanilla JS (không bundler).
- **Manifest**: `apps/extension/manifest.json` — `matches: *://leetcode.com/problems/*`, `permissions: clipboardWrite`, `host_permissions: *://leetcode.com/*`.
- **Content**: `content.js` — widget `LC` draggable (fixed, z-index 999999), click → `buildProblemClip` → `navigator.clipboard.writeText`, toast.
- **Logic thuần**: `src/clipper.ts` — `findDescriptionContainer`, `extractDifficulty`, `cleanDescription`, `buildProblemClip`, `isValidProblemClip` (42 tests với jsdom).
- **Style**: `style.css` — widget tròn 52px, toast, trạng thái success/error.

## Shared Components

Không có shared UI component. Các package chia sẻ logic và types:

- `packages/shared` — types (`ProblemMeta`, `ProblemClip`, `Difficulty`, `TestCase`), utils (`formatProblemId`).
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
| `apps/extension/content.js` | Content script widget |
| `apps/extension/src/clipper.ts` | Pure extraction logic (testable) |
| `packages/shared/src/index.ts` | Types và utils (có ProblemClip) |
| `packages/editor/src/index.ts` | Editor state |
| `packages/problem-engine/src/index.ts` | ProblemEngine class |
| `packages/ai/src/index.ts` | AI hint placeholder |