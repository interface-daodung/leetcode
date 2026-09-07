# Database {#database}

## Tổng quan

`packages/database` — SQLite qua `@libsql/client` + **Drizzle ORM**. Cung cấp schema, client, CRUD, migration.

- Package chỉ export qua `src/index.ts`
- Dùng bởi `apps/server`, `packages/problem-engine`

## Schema `problems` (sau migration 0001)

| Column | Type | Ghi chú |
|--------|------|---------|
| `id` | integer (PK) | |
| `title` | text NOT NULL | |
| `difficulty` | text NOT NULL | `easy` \| `medium` \| `hard` |
| `tags` | text (JSON) | default `[]` |
| `description` | text NOT NULL | HTML sanitize |
| `template` | text nullable | Code khởi tạo (thay `solution`) |
| `url` | text nullable | Link LeetCode gốc |
| `slug` | text nullable | URL slug |
| `test_cases` | text (JSON) | default `[]` |
| `created_at` | text | default `datetime('now')` |

> Migration 0001: thêm `slug`/`url`/`template`, xóa `solution`, tạo `problem_assets` + `hints`. Sửa `0000_init.sql` dùng `text` thay `NVARCHAR(MAX)`/`DATETIME` fix `SQLITE_ERROR near "MAX"`.

### Bảng `problem_assets`

| Column | Type | Ghi chú |
|--------|------|---------|
| `id` | integer (PK) | |
| `problem_id` | integer FK | → `problems.id` cascade |
| `original_url` | text | URL gốc ảnh |
| `local_path` | text | Đường dẫn local relative |
| `hash` | text | SHA-256 hash (index) |

### Bảng `hints`

| Column | Type | Ghi chú |
|--------|------|---------|
| `id` | integer (PK) | |
| `problem_id` | integer FK | → `problems.id` cascade |
| `ord` | integer | Thứ tự hint |
| `content` | text | HTML content |

## Client & Auto-migrate

```typescript
// packages/database/src/client.ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const client = createClient({
  url: `file:${resolveDbPath()}`,  // packages/database/data/leetcode.db
});

export const db = drizzle(client, { schema });

// Auto-migrate mỗi khi import package
migrate(db, { migrationsFolder: "./drizzle" });
```

- DB file: `packages/database/data/leetcode.db` (bị `.gitignore`, chỉ track `.gitkeep`)
- Path resolve cố định từ `import.meta.url`, **không phụ thuộc CWD**
- Migration folder: `packages/database/drizzle/`

## CRUD — ProblemDatabase Class

Singleton `problemDb` export từ `src/index.ts`:

| Method | Mô tả |
|--------|-------|
| `add(problem)` | Insert + `onConflictDoNothing` (fire-and-forget) |
| `get(id)` | Select theo id |
| `getByDifficulty(difficulty)` | Lọc theo difficulty |
| `getAll()` | Lấy tất cả |
| `getAllWithHints()` | Lấy tất cả + hints (join) |
| `getHints(problemId)` | Lấy hints theo `ord` |
| `setHints(problemId, hints)` | Upsert hints (delete + insert) |
| `addAsset(problemId, asset)` | Thêm asset (FK) |
| `findAssetByHash(hash)` | Tìm asset bằng hash (dedupe) |
| `findAssetsByProblem(problemId)` | Lấy assets của problem |
| `updateDescription(id, description)` | Cập nhật description |
| `update(id, patch)` | Cập nhật partial (dùng cho PUT ghi đè) |
| `delete(id)` | Xóa theo id (cascade assets/hints) |

## Migration Commands

```bash
pnpm --filter=@leetcode/database db:generate   # Tạo migration mới (drizzle-kit)
pnpm --filter=@leetcode/database db:migrate    # Chạy migration (optional, auto lúc runtime)
pnpm --filter=@leetcode/database db:studio     # Drizzle Studio UI
```

## Migration Files

```
packages/database/drizzle/
  0000_init.sql                    # Tạo bảng problems + seed 3 mẫu
  0001_add_url_template_hints_assets.sql  # Thêm slug/url/template, xóa solution, tạo problem_assets + hints
  meta/
    _journal.json                  # Drizzle migration journal
    0000_snapshot.json
    0001_snapshot.json
```

## Dependency

```
@leetcode/database ──▶ @leetcode/shared, drizzle-orm, @libsql/client
```

## Build & Test

```bash
pnpm --filter=@leetcode/database build   # tsc --noEmit (type-check)
pnpm --filter=@leetcode/database test    # Vitest (mock DB tests)
pnpm --filter=@leetcode/database lint    # ESLint
```

## Ghi chú

- Server hiện **chưa dùng database để đọc**; chỉ `problem-engine` ghi fire-and-forget khi `engine.register()`
- Mục tiêu README: in-memory → SQLite → PostgreSQL
- `created_at` fix: `default(sql`(datetime('now'))`)` (commit `fa9c962`)
- `assets/` folder và `.hash-index.json` cũ đã xóa (chuyển sang DB)
- `.gitignore`: `*.db`, `data/assets/`, `.hash-index.json`