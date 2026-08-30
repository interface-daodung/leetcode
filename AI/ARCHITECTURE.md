# Architecture

## Tổng quan

Monorepo dạng pnpm workspace gồm 3 ứng dụng (`apps/web`, `apps/server`, `apps/extension`) và 6 package dùng chung (`packages/*`). Dependency chảy theo hướng `apps → packages`; các package có thể phụ thuộc lẫn nhau (ví dụ `problem-engine` phụ thuộc `database` và `shared`).

`problem-engine` dùng **in-memory registry** (`Map`) + **SQLite** (`packages/database`) làm persistence. Server hydrate `engine` từ SQLite khi khởi động. Dữ liệu đề bài được đưa vào qua **LeetCode Clipper Extension** (DOM clip → JSON → `POST /api/problems/import`).

## Thành phần

```text
apps/web                  # React SPA: editor + ProblemImportPaste (paste JSON → preview → save)
apps/server               # Fastify: GET/POST /api/problems/..., POST /api/problems/import
apps/extension            # MV3 Browser Extension: widget nổi trên leetcode.com/problems/*, clip DOM → clipboard
packages/shared           # Types & utils dùng chung (ProblemMeta, ProblemClip, Difficulty)
packages/database         # Drizzle ORM + SQLite (bảng problems)
packages/editor           # EditorState, languageTemplates
packages/problem-engine   # Problem registry + runTests (in-memory + DB hydrate)
packages/ai               # getHint/explainSolution (placeholder)
packages/javascript-docs  # jsDocs/getDoc (static)
```

## Dependency Flow

```text
apps/web ──> shared, editor
apps/server ──> shared, database, problem-engine, ai
apps/extension ──> (độc lập, vanilla JS; logic thuần src/clipper.ts, không phụ thuộc workspace build)
problem-engine ──> shared, database
database ──> shared, drizzle-orm, @libsql/client
editor ──> shared
ai ──> shared
javascript-docs ──> shared
```

## Runtime Flow

```text
apps/server (Fastify, port 3000) — có CORS, hydrate từ DB khi khởi động
  ├─ GET /health
  ├─ GET /api/problems              → problemDb.getAll() (đã hydrate)
  ├─ GET /api/problems/:id          → engine.get(id) → fallback problemDb.get(id)
  ├─ GET /api/problems/random/:difficulty?
  │                                 → engine.getRandom(difficulty)
  ├─ POST /api/problems/:id/run     → new Function + engine.runTests
  ├─ POST /api/problems/:id/hint    → ai.getHint (placeholder)
  └─ POST /api/problems/import      → validate ProblemClip → engine.register + problemDb.add (201/409)

apps/web (Vite, port 5173)
  ├─ App.tsx: createEditorState + run code cục bộ + fetch GET /api/problems (list)
  └─ components/ProblemImportPaste: paste JSON → parseProblemClipJson → preview (sanitize) → POST /api/problems/import

apps/extension (MV3, leetcode.com/problems/*)
  └─ content.js: widget LC (draggable) → buildProblemClip(doc) → cleanDescription → navigator.clipboard.writeText(JSON)
```

## Data Flow

```text
Clip: leetcode.com DOM [data-track-load="description_content"] → ProblemClip JSON → clipboard → web paste
Import: web POST /api/problems/import → engine.register + problemDb.add → GET /api/problems
Read: engine (hydrate từ DB khi start) + problemDb.getAll / get(id) → API → web
```

Dữ liệu đề bài vào qua **Clipper Extension** (DOM) thay vì seed/API LeetCode. `engine.register` vừa ghi in-memory vừa `problemDb.add` (fire-and-forget + await đảm bảo); server hydrate lại từ SQLite khi khởi động để không mất dữ liệu sau restart. Seed script đã bị bỏ.

## External Services

Chưa xác định. `packages/ai` chỉ là placeholder, chưa gọi LLM API thật.

## Database

- SQLite qua `@libsql/client`, DB file tại `packages/database/data/leetcode.db` (path resolve cố định từ `client.ts`, không phụ thuộc CWD).
- Drizzle ORM với schema `problems` (`packages/database/src/schema.ts`).
- Migration đầu tiên: `packages/database/drizzle/0000_init.sql` (bao gồm seed 3 problems mẫu).
- **Auto-migrate lúc runtime**: `client.ts` gọi `migrate()` mỗi khi import → tự tạo/cập nhật schema.
- CLI migration (optional): `db:migrate` (drizzle-kit, dùng `@libsql/client` không cần native build). Đã bỏ `db:push`.
- Các script: `db:generate`, `db:migrate`, `db:studio`.
- README ghi kế hoạch: in-memory → SQLite → PostgreSQL.

## Deployment

- `apps/web` và `apps/server` chưa có cấu hình deploy.
- `apps/extension` là MV3 unpacked: load thủ công qua `chrome://extensions` → `Load unpacked` chọn `apps/extension` (không qua store, không cần build).

## Architectural Decisions

Xem:

`context/decisions.md`

---

> File này phải phản ánh implementation thực tế.
