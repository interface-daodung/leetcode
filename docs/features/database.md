# Database {#database}

## Giới thiệu {#gioi-thieu}

`packages/database` dùng **SQLite** qua `@libsql/client` và **Drizzle ORM**. Hiện có một bảng `problems` và migration đầu tiên.

## Schema `problems` {#schema}

| Column | Type | Ghi chú |
|--------|------|---------|
| `id` | `integer` (PK) | |
| `title` | `text` (NOT NULL) | |
| `difficulty` | `text` (NOT NULL) | enum: `easy`, `medium`, `hard` |
| `tags` | `text` (JSON) | default `[]` |
| `description` | `text` (NOT NULL) | |
| `solution` | `text` (nullable) | |
| `test_cases` | `text` (JSON) | default `[]` |
| `created_at` | `text` | default `datetime('now')` |

## Client & Auto-migrate {#client}

```text
packages/database/src/client.ts
  ├─ createClient({ url: file:<abs>/packages/database/data/leetcode.db })
  ├─ drizzle(sqlite, { schema })
  └─ migrate(db, { migrationsFolder }) → auto-migrate mỗi khi import
```

- DB file tại `packages/database/data/leetcode.db` (bị git ignore, chỉ track `.gitkeep`).
- Path resolve cố định từ `import.meta.url`, không phụ thuộc CWD.

## CRUD {#crud}

`ProblemDatabase` class (singleton `problemDb`):

- `add(problem)` — insert + `onConflictDoNothing`
- `get(id)` — select theo id
- `getByDifficulty(difficulty)` — lọc theo difficulty
- `getAll()` — lấy tất cả
- `delete(id)` — xóa theo id

## Migration {#migration}

- Migration đầu tiên: `0000_init.sql` (tạo bảng + seed 3 problems mẫu).
- Generate: `pnpm --filter=@leetcode/database db:generate` (drizzle-kit).
- Auto-apply lúc runtime khi import package.
- CLI optional: `db:migrate`, `db:studio`.
- Journal table: `__drizzle_migrations`.

## Ghi chú {#ghi-chu}

- Server hiện chưa dùng database để đọc; chỉ `problem-engine` ghi fire-and-forget.
- Mục tiêu README: in-memory → SQLite → PostgreSQL.