# Kiến trúc LeetCode Lab {#kien-truc}

## Tổng quan {#tong-quan}

Monorepo pnpm workspace gồm 2 ứng dụng và 6 package nội bộ. Dependency chảy theo hướng `apps → packages`.

```text
apps/web                  # React SPA
apps/server               # Fastify API
packages/shared           # Types, utilities
packages/database         # Drizzle ORM + SQLite
packages/editor           # Editor state, templates
packages/problem-engine   # In-memory registry, test runner
packages/ai               # LLM placeholder
packages/javascript-docs  # JS/TS reference (static)
```

## Dependency Flow {#dependency-flow}

```text
apps/web ──> shared, editor, problem-engine
apps/server ──> shared, database, problem-engine, ai
problem-engine ──> shared, database
database ──> shared, drizzle-orm, @libsql/client
editor ──> shared
ai ──> shared
javascript-docs ──> shared
```

## Runtime Flow {#runtime-flow}

### Server (port 3000)

```text
GET  /health                        → health check
GET  /api/problems/:id              → engine.get(id)
GET  /api/problems/random/:difficulty? → engine.getRandom(difficulty)
POST /api/problems/:id/run          → lọc comment → trích hàm → engine.runTestsDetailed (trả per-case results)
POST /api/problems/:id/hint         → ai.getHint (placeholder)
```

### Web (port 5173)

```text
index.html → main.tsx → App.tsx
  ├─ createEditorState() (từ @leetcode/editor)
  ├─ textarea + run code cục bộ (new Function)
  └─ hiển thị output
```

> Hiện web chạy code cục bộ, chưa gọi API server.

## Data Flow {#data-flow}

```text
API read: engine.get / getRandom (in-memory Map)
Database: problemDb.add (fire-and-forget khi engine.register)
```

> Server đọc từ in-memory registry, không phải SQLite.

## Công nghệ {#cong-nghe}

| Công nghệ | Phiên bản | Dùng cho |
|-----------|-----------|----------|
| TypeScript | 5.5+ | Toàn bộ (strict mode) |
| React | 18.3 | `apps/web` |
| Vite | 5 | `apps/web` (dev/build) |
| Fastify | 4 | `apps/server` |
| Drizzle ORM | 0.45 | `packages/database` |
| SQLite | — | `packages/database` (libsql) |
| Zod | 3 | Validation (server) |
| Vitest | 2 | Testing |
| ESLint | 9 | Linting |
| tsx | 4 | Node runner (server) |

## Database {#database}

- SQLite file tại `packages/database/data/leetcode.db`
- Auto-migrate runtime khi import package
- Một bảng `problems` (id, title, difficulty, tags, description, solution, test_cases, created_at)
- Migration đầu tiên: `0000_init.sql` (tạo bảng + seed 3 problems mẫu)

## Glossary {#glossary}

| Thuật ngữ | Ý nghĩa |
|-----------|---------|
| `@leetcode/*` | Alias workspace cho package nội bộ |
| `ProblemMeta` | Type metadata problem |
| `ProblemEngine` | Class quản lý in-memory registry + test runner |
| `ProblemDatabase` | Class CRUD SQLite |
| `Difficulty` | `"easy" | "medium" | "hard"` |
| `TestCase` | `{ input: unknown; expected: unknown }` |
| `EditorState` | `{ code: string; language: string; problemId?: number }` |
| `AIHint` | `{ type: "approach" | "optimization" | "edge-case"; message: string }` |
| `AIResponse` | `{ hints: AIHint[]; explanation: string; complexity: { time: string; space: string } }` |

## Technical Decisions {#technical-decisions}

- Dùng `AGENT.md` làm instruction entry cho opencode
- Gộp Plan Management vào skill feature-development
- Seed script bị bỏ; dữ liệu đưa vào qua server/API sau này
- DB path cố định từ `import.meta.url`, không phụ thuộc CWD