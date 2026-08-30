# Architecture

## Tổng quan

Monorepo dạng pnpm workspace gồm 2 ứng dụng (`apps/web`, `apps/server`) và 6 package dùng chung (`packages/*`). Dependency chảy theo hướng `apps → packages`; các package có thể phụ thuộc lẫn nhau (ví dụ `problem-engine` phụ thuộc `database` và `shared`).

Hiện tại `problem-engine` dùng **in-memory registry** (`Map`) và là nguồn dữ liệu chính cho API. SQLite (`packages/database`) đã được khởi tạo với Drizzle nhưng chưa được dùng làm nguồn đọc chính trong server.

## Thành phần

```text
apps/web                  # React SPA: editor state + run code cục bộ
apps/server               # Fastify: GET/POST /api/problems/...
packages/shared           # Types & utils dùng chung
packages/database         # Drizzle ORM + SQLite (bảng problems)
packages/editor           # EditorState, languageTemplates
packages/problem-engine   # Problem registry + runTests (in-memory)
packages/ai               # getHint/explainSolution (placeholder)
packages/javascript-docs  # jsDocs/getDoc (static)
```

## Dependency Flow

```text
apps/web ──> shared, editor, problem-engine
apps/server ──> shared, database, problem-engine, ai
problem-engine ──> shared, database
database ──> shared, drizzle-orm, @libsql/client
editor ──> shared
ai ──> shared
javascript-docs ──> shared
```

## Runtime Flow

```text
apps/server (Fastify, port 3000)
  ├─ GET /health
  ├─ GET /api/problems/:id          → engine.get(id)
  ├─ GET /api/problems/random/:difficulty?
  │                                 → engine.getRandom(difficulty)
  ├─ POST /api/problems/:id/run     → new Function + engine.runTests
  └─ POST /api/problems/:id/hint    → ai.getHint (placeholder)

apps/web (Vite, port 5173)
  └─ App.tsx: createEditorState + run code cục bộ (chưa gọi API)
```

## Data Flow

```text
API read: engine.get / getRandom (in-memory)
Database read: ProblemDatabase (chưa được server dùng để đọc)
```

Lưu ý: `engine.register` gọi `problemDb.add` không đồng bộ (`void`) để ghi vào SQLite, nhưng việc đọc từ API hiện chỉ dựa trên in-memory registry. Seed script đã bị bỏ — dữ liệu sẽ được đưa vào qua server/API sau này.

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

Chưa được xác định từ repository. Không có cấu hình deploy nào được phát hiện.

## Architectural Decisions

Xem:

`context/decisions.md`

---

> File này phải phản ánh implementation thực tế.
