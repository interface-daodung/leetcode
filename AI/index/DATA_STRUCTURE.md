# Data Structure

## Database

- **Engine**: SQLite (qua `@libsql/client`).
- **ORM**: Drizzle ORM.
- **Config**: `packages/database/drizzle.config.ts` (dialect: sqlite, schema: `./src/schema.ts`, out: `./drizzle`).
- **Connection URL**: `file:<abs path>/packages/database/data/leetcode.db` (được resolve cố định từ `client.ts` qua `import.meta.url`, không phụ thuộc CWD).
- **DB file location**: `packages/database/data/leetcode.db`.
- **Migration**: auto-migrate lúc runtime trong `packages/database/src/client.ts` (`migrate(db, { migrationsFolder })`), chạy mỗi khi import package.

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
Clip (extension → clipboard → web):
  leetcode.com DOM [data-track-load="description_content"] → ProblemClip JSON → clipboard → web ProblemImportPaste

API server (apps/server, có CORS + hydrate)
  ├─ GET /api/problems          → problemDb.getAll()
  ├─ GET /api/problems/:id      → engine.get(id) → fallback problemDb.get(id)
  ├─ GET /api/problems/random   → engine.getRandom → in-memory
  ├─ POST /api/problems/:id/run → engine.runTests → in-memory
  ├─ POST /api/problems/:id/hint→ ai.getHint → placeholder
  └─ POST /api/problems/import  → validate ProblemClip → engine.register + problemDb.add (201/409)

Web app (apps/web)
  ├─ ProblemImportPaste: POST /api/problems/import → preview + save
  └─ App.tsx: GET /api/problems (list) + run code locally (new Function)
```

Dữ liệu đề bài vào qua **Clipper Extension** (DOM clip → JSON). Seed script đã bị bỏ.

## Migrations

- Migration đầu tiên: `packages/database/drizzle/0000_init.sql` (tạo bảng `problems` + seed 3 problems mẫu).
- Workflow:
  - Tạo/đổi schema trong `packages/database/src/schema.ts`.
  - Generate migration: `pnpm --filter=@leetcode/database db:generate` (drizzle-kit generate).
  - **Auto-apply**: `packages/database/src/client.ts` tự gọi `migrate()` khi import → server/API tự cập nhật schema, không cần chạy lệnh riêng.
  - CLI (optional): `pnpm --filter=@leetcode/database db:migrate` (drizzle-kit migrate, dùng `@libsql/client` WASM không cần native build).
- Migration journal table: `__drizzle_migrations`.
- Schema hiện tại chỉ có 1 bảng `problems`.

## Seed

- Đã bỏ khỏi dự án (theo quyết định — dữ liệu vào qua server khác, không dùng seed nhiều).

## External Data

Chưa xác định. Không có external API call (kể cả AI hint chỉ là placeholder).