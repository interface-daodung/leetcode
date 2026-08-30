# Application Structure

## Applications

Có 2 ứng dụng trong monorepo:

1. **`@leetcode/web`** — React + Vite frontend (apps/web)
2. **`@leetcode/server`** — Fastify API server (apps/server)

## Application Entry Points

- Web: `apps/web/index.html` → `apps/web/src/main.tsx` → `App.tsx`
- Server: `apps/server/src/index.ts` (Fastify listen on port 3000)

## Frontend

- **Framework**: React 18.3, Vite 5, `@vitejs/plugin-react`.
- **Entry**: `index.html` → `main.tsx` → `App.tsx`.
- **App.tsx** hiện tại: textarea editor, run code cục bộ (new Function), hiển thị output.
- **Dependencies**: `@leetcode/shared`, `@leetcode/editor`, `@leetcode/problem-engine`.
- **Chưa có**: routing, state management, Monaco Editor thật, API client.

## Backend

- **Framework**: Fastify 4 với logger.
- **Entry**: `apps/server/src/index.ts`.
- **Endpoints**:
  - `GET /health` — health check.
  - `GET /api/problems/:id` — lấy problem theo id.
  - `GET /api/problems/random/:difficulty?` — random problem.
  - `POST /api/problems/:id/run` — chạy test với code body.
  - `POST /api/problems/:id/hint` — lấy hint (placeholder).
- **Validation**: Zod (parse params/body manually, không dùng Fastify schema).
- **Dependencies**: `@leetcode/shared`, `@leetcode/database`, `@leetcode/problem-engine`, `@leetcode/ai`.
- **Chưa có**: auth, middleware, error handler tập trung, WebSocket.

## Shared Components

Không có shared UI component. Các package chia sẻ logic và types:

- `packages/shared` — types (`ProblemMeta`, `Difficulty`, `TestCase`), utils (`formatProblemId`).
- `packages/editor` — `EditorState`, `createEditorState`, `languageTemplates`.
- `packages/problem-engine` — `ProblemEngine` (registry + test runner).
- `packages/database` — `ProblemDatabase` (SQLite CRUD).
- `packages/ai` — `getHint`, `explainSolution` (placeholder).
- `packages/javascript-docs` — `jsDocs`, `getDoc` (static).

## Important Paths

| Path | Purpose |
|------|---------|
| `apps/web/src/App.tsx` | UI component chính |
| `apps/web/src/main.tsx` | React DOM mount |
| `apps/server/src/index.ts` | Fastify routes |
| `packages/shared/src/index.ts` | Types và utils |
| `packages/editor/src/index.ts` | Editor state |
| `packages/problem-engine/src/index.ts` | ProblemEngine class |
| `packages/ai/src/index.ts` | AI hint placeholder |