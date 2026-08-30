# Data Structure

## Database

- **Engine**: SQLite (qua `@libsql/client`).
- **ORM**: Drizzle ORM.
- **Config**: `packages/database/drizzle.config.ts` (dialect: sqlite, schema: `./src/schema.ts`, out: `./drizzle`).
- **Connection URL**: `file:leetcode.db` (SQLite file local).

## Models / Tables / Collections

### `problems` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | `integer` (PK) | |
| `title` | `text` (NOT NULL) | |
| `difficulty` | `text` (NOT NULL) | enum: `easy`, `medium`, `hard` |
| `tags` | `text` (JSON) | default `[]`, stored as JSON string |
| `description` | `text` (NOT NULL) | |
| `solution` | `text` (nullable) | |
| `test_cases` | `text` (JSON) | default `[]`, stored as JSON string |
| `created_at` | `text` | default `datetime('now')` |

## Data Flow

```text
Seed script (scripts/seed-problems.ts)
  └─ engine.register(problem)
       ├─ problem-engine: lưu vào in-memory Map
       └─ (void) problemDb.add(problem) → SQLite

API server (apps/server)
  ├─ GET /api/problems/:id  → engine.get(id)  → in-memory
  ├─ GET /api/problems/random → engine.getRandom → in-memory
  ├─ POST /api/problems/:id/run → engine.runTests → in-memory
  └─ POST /api/problems/:id/hint → ai.getHint → placeholder

Web app (apps/web)
  └─ App.tsx: run code locally (new Function), không gọi API database
```

## Migrations

- Migration đầu tiên: `packages/database/drizzle/0000_faithful_captain_britain.sql`.
- Workflow: `drizzle-kit generate` → `drizzle-kit push`.
- Schema hiện tại chỉ có 1 bảng `problems`.

## Seed

- `scripts/seed-problems.ts` đăng ký 3 sample problems vào `engine`:
  1. Two Sum (easy)
  2. Add Two Numbers (medium)
  3. Longest Substring Without Repeating Characters (medium)
- Cách chạy: `pnpm --filter=@leetcode/server tsx scripts/seed-problems.ts`

## External Data

Chưa xác định. Không có external API call (kể cả AI hint chỉ là placeholder).