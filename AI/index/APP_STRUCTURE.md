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

- **Framework**: React 18.3, Vite 5, `@vitejs/plugin-react`.
- **Entry**: `index.html` → `main.tsx` → `App.tsx`.
- **App.tsx** hiện tại: textarea editor + `ProblemImportPaste` (paste JSON → preview → POST import) + list problems từ `GET /api/problems`.
- **Components**: `components/ProblemImportPaste.tsx` (paste/clipboard, validate, sanitize, save), `lib/problemClip.ts` (parse + sanitize HTML).
- **Dependencies**: `@leetcode/shared`.
- **Chưa có**: routing, state management, Monaco Editor thật.

## Backend

- **Framework**: Fastify 4 với logger, CORS (`Access-Control-Allow-Origin: *`), hydrate DB khi khởi động.
- **Entry**: `apps/server/src/index.ts` (env + `createApp()` + hydrate + listen); `src/app.ts` đăng ký plugins/routes.
- **Kiến trúc**: MVC / phân tầng — `routes/` (path) → `controllers/` (Zod validate + trả response) → `services/` (logic nghiệp vụ) → `plugins/` (CORS, static) + `config.ts`.
- **Endpoints**:
  - `GET /health` — health check.
  - `GET /api/problems` — list tất cả problems (từ DB, kèm hints).
  - `GET /api/problems/:id` — lấy problem theo id (engine → fallback DB, kèm hints/assets).
  - `GET /api/problems/random/:difficulty?` — random problem.
  - `POST /api/problems/:id/run` — chạy test với code body.
  - `POST /api/problems/:id/hint` — lấy hint (placeholder).
  - `GET /api/problems/:id/hints` — hints từ DB.
  - `GET /api/problems/:id/assets` — assets từ DB.
  - `POST /api/problems/import` — import ProblemClip JSON (validate Zod, 201/409/400).
- **Validation**: Zod (parse params/body manually, không dùng Fastify schema).
- **Dependencies**: `@leetcode/shared`, `@leetcode/database`, `@leetcode/problem-engine`, `@leetcode/ai`.
- **Chưa có**: auth, middleware, error handler tập trung, WebSocket.

## Extension (Browser)

- **Type**: Manifest V3, content script vanilla JS (không bundler).
- **Manifest**: `apps/extension/manifest.json` — `matches: *://leetcode.com/problems/*`, `permissions: clipboardWrite`, `host_permissions: *://leetcode.com/*`.
- **Content**: `content.js` — widget `LC` draggable (fixed, z-index 999999), click → `buildProblemClip` → `navigator.clipboard.writeText`, toast.
- **Logic thuần**: `src/clipper.ts` — `findDescriptionContainer`, `extractDifficulty`, `cleanDescription`, `buildProblemClip`, `isValidProblemClip` (28 tests với jsdom).
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
| `apps/web/src/App.tsx` | UI + ProblemImportPaste + problem list |
| `apps/web/src/components/ProblemImportPaste.tsx` | Paste JSON → preview → import |
| `apps/web/src/lib/problemClip.ts` | parse + sanitize clip JSON |
| `apps/web/src/main.tsx` | React DOM mount |
| `apps/server/src/index.ts` | Entry: env + createApp + hydrate + listen |
| `apps/server/src/app.ts` | createApp(): Fastify instance + plugins + routes |
| `apps/server/src/routes/` | Khai báo path (health, problems) |
| `apps/server/src/controllers/` | Zod validate + trả response |
| `apps/server/src/services/` | Logic nghiệp vụ (problem.service, asset.service) |
| `apps/extension/manifest.json` | MV3 manifest |
| `apps/extension/content.js` | Content script widget |
| `apps/extension/src/clipper.ts` | Pure clipper logic (testable) |
| `packages/shared/src/index.ts` | Types và utils (có ProblemClip) |
| `packages/editor/src/index.ts` | Editor state |
| `packages/problem-engine/src/index.ts` | ProblemEngine class |
| `packages/ai/src/index.ts` | AI hint placeholder |