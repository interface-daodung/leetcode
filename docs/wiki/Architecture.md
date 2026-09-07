# Kiến trúc tổng quan {#kien-truc-tong-quan}

## Monorepo Structure

```text
apps/
  web           # React 18 + Vite SPA
  server        # Fastify 4 API
  extension     # MV3 Browser Extension
packages/
  shared           # Types, utilities, constants
  database         # Drizzle ORM + SQLite (libsql)
  problem-engine   # In-memory registry + test runner
  ai               # LLM integration (placeholder)
  javascript-docs  # JS/TS static reference + autocomplete
  layout           # FlexLayout wrap (dockable IDE)
```

## Dependency Flow

```
apps/web ──▶ shared, javascript-docs, problem-engine
apps/server ──▶ shared, database, problem-engine, ai
apps/extension ──▶ (standalone, copies shared types)
packages/problem-engine ──▶ shared, database
packages/database ──▶ shared, drizzle-orm, @libsql/client
packages/layout ──▶ shared, react, flexlayout-react
packages/ai ──▶ shared
packages/javascript-docs ──▶ shared
```

> Dependency chảy theo hướng `apps → packages`. Package nội bộ import qua alias `@leetcode/*` + `workspace:*`.

## Runtime Flow

### Server (port 3000)

```
GET  /health                          → health check
GET  /api/problems                    → List từ DB (kèm hints)
GET  /api/problems/:id                → Engine.get(id) + hints/assets từ DB
GET  /api/problems/random/:difficulty? → Engine.getRandom()
POST /api/problems/:id/run            → Strip comment → Extract fn → Engine.runTestsDetailed()
POST /api/problems/:id/hint           → AI.getHint() (placeholder)
GET  /api/problems/:id/hints          → DB hints (theo ord)
GET  /api/problems/:id/assets         → DB assets
POST /api/playground/:slug            → Ghi playground/<slug>.js + trả VS Code link
POST /api/problems/import             → Import ProblemClip (validate, tải ảnh, 201/409/400)
GET  /assets/*                        → Serve ảnh local từ packages/database/data/assets/<slug>/
```

### Web (port 5173)

```
index.html → main.tsx (BrowserRouter + ThemeProvider + WorkspaceProvider)
  → App.tsx (Routes)
    → Header
    → /problems/:id → ProblemLoader → WorkspaceLayout
      → Explorer Panel (danh sách đề, search, filter difficulty)
      → Editor Panel (CodeEditor: contentEditable + Prism, Run, VS Code)
      → Description Panel (HTML sanitize + hints toggle)
      → Output Panel (TestCaseTabs: Input/Expected/Actual + badge + passed/total)
```

### Extension

```
content.js (IIFE bundle từ esbuild)
  → Widget LC draggable (4 trạng thái ảnh PNG + Squash & Stretch animation)
  → Clip DOM (id, slug, title, difficulty, tags, description, template, hints, testCases)
  → Validate → POST /api/problems/import (direct) + copy clipboard
  → Toast SVG động (auto font-size, wrap, position góc trên-phải widget)
  → Retry PUT /api/problems/:id khi 409 (ghi đè)
```

## Data Flow

```
API Read:  Engine.get / getRandom / search / listByDifficulty (in-memory Map)
API Write: engine.register(problem) → problemDb.add (fire-and-forget, void)
DB:        problemDb.add/get/getAll/getByDifficulty/delete
           getAllWithHints, getHints/setHints, addAsset/findAssetByHash
```

> ⚠️ Server đọc problem từ **in-memory registry** (`engine`), **KHÔNG** đọc từ SQLite. `problemDb.add` chỉ ghi fire-and-forget khi `engine.register`.

## Công nghệ

| Công nghệ | Phiên bản | Dùng cho |
|-----------|-----------|----------|
| TypeScript | 5.5+ | Toàn bộ (strict mode) |
| React | 18.3 | `apps/web` |
| Vite | 5 | `apps/web` dev/build |
| Fastify | 4 | `apps/server` |
| Drizzle ORM | 0.45 | `packages/database` |
| SQLite | — | `packages/database` (libsql) |
| Zod | 3 | Validation (server) |
| Vitest | 2 | Testing |
| ESLint | 9 | Linting |
| tsx | 4 | Node runner (server) |
| Tailwind CSS | 4 | `apps/web` styling |
| FlexLayout | (react) | Dockable layout |
| react-syntax-highlighter | — | Code highlighting |

## Database

- SQLite file: `packages/database/data/leetcode.db` (bị `.gitignore`)
- Auto-migrate runtime khi import `@leetcode/database` (`client.ts` gọi `migrate()`)
- Path cố định từ `import.meta.url`, không phụ thuộc CWD

### Schema `problems` (sau migration 0001)

| Column | Type | Ghi chú |
|--------|------|---------|
| `id` | integer (PK) | |
| `title` | text NOT NULL | |
| `difficulty` | text NOT NULL | easy/medium/hard |
| `tags` | text (JSON) | default `[]` |
| `description` | text NOT NULL | HTML sanitize |
| `template` | text nullable | Code khởi tạo (thay `solution`) |
| `url` | text nullable | Link LeetCode gốc |
| `slug` | text nullable | URL slug |
| `test_cases` | text (JSON) | default `[]` |
| `created_at` | text | default `datetime('now')` |

### Bảng phụ

- `problem_assets` — id, problem_id FK cascade, original_url, local_path, hash (+ index)
- `hints` — id, problem_id FK cascade, ord, content

### Migration

- `0000_init.sql` — Tạo bảng + seed 3 problems mẫu (dùng `text` thay `NVARCHAR(MAX)`)
- `0001_add_url_template_hints_assets.sql` — Thêm slug/url/template, xóa solution, tạo problem_assets + hints
- Generate: `pnpm --filter=@leetcode/database db:generate`
- CLI: `db:migrate`, `db:studio`

## Luật Phân Tầng (Bắt Buộc)

1. **Server chỉ chứa code API** (routes, controllers, plugins, config, wiring) — không domain logic
2. **Model/entity dùng chung đặt ở `packages/shared`** — server và client import chung
3. **Domain logic độc lập đặt trong `packages/*`** — server chỉ gọi service
4. **Logic vẽ giao diện đặt trong `apps/web/src/components/`** — không tách component ra package

## Package Manager

- pnpm 11.24.0 workspace (`pnpm-workspace.yaml`)
- Package nội bộ: `workspace:*` + alias `@leetcode/*`
- Toàn bộ ESM (`"type": "module"`, NodeNext)
- Import file cùng package phải ghi đuôi `.js` (vd `./schema.js`)
- Package chỉ export qua `src/index.ts`

## TypeScript Config

- Root: target ES2022, module NodeNext, moduleResolution NodeNext
- Packages: `main`/`types` trỏ vào `src/index.ts`
- Server: outDir `./dist` (emit)
- Web: module ESNext + bundler, JSX `react-jsx`
- Path alias `@leetcode/*` trong tsconfig/vite

Xem thêm: [Development Guide](Development.md) · [Technical Decisions](Technical-Decisions.md) · [Glossary](Glossary.md)