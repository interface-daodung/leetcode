# @leetcode/database

SQLite storage với Drizzle ORM cho LeetCode Lab.

## Tính năng

- Bảng `problems` (id, title, difficulty, tags, description, solution, test_cases, created_at)
- Auto-migrate runtime khi import package
- `ProblemDatabase` class CRUD (add, get, getByDifficulty, getAll, delete)

## Chạy

```bash
pnpm --filter=@leetcode/database db:generate   # Tạo migration mới
pnpm --filter=@leetcode/database db:migrate    # Chạy migration (optional)
pnpm --filter=@leetcode/database db:studio     # Drizzle Studio
```

## Vị trí

- DB file: `packages/database/data/leetcode.db` (bị git ignore)
- Schema: `packages/database/src/schema.ts`
- Client + auto-migrate: `packages/database/src/client.ts`
- Migrations: `packages/database/drizzle/`

## Công nghệ

- Drizzle ORM 0.45, drizzle-kit 0.31
- `@libsql/client` (SQLite, WASM không cần native build)

## Tài liệu

- [Database](../../docs/features/database.md)

## Ghi chú

- Server chưa dùng database để đọc; chỉ `problem-engine` ghi fire-and-forget khi register.
- Mục tiêu: in-memory → SQLite → PostgreSQL.