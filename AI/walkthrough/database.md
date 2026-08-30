# Database Walkthrough

> Tài liệu này sẽ được bổ sung dựa trên implementation thực tế.

## Overview

Database sử dụng SQLite với Drizzle ORM. Hiện tại chỉ có một bảng `problems` và migration đầu tiên đã được tạo.

## Flow

```text
Schema: packages/database/src/schema.ts
  └─ sqliteTable("problems") → Drizzle ORM

Client: packages/database/src/client.ts
  ├─ createClient({ url: file:<abs>/packages/database/data/leetcode.db }) → @libsql/client
  ├─ drizzle(sqlite, { schema }) → db instance
  └─ migrate(db, { migrationsFolder }) → auto-migrate runtime (mỗi khi import)

CRUD: packages/database/src/index.ts
  └─ ProblemDatabase class
       ├─ add(problem) → db.insert(schema.problems).values(...).onConflictDoNothing()
       ├─ get(id) → db.select().where(eq(problems.id, id))
       ├─ getByDifficulty(difficulty) → filter by difficulty
       ├─ getAll() → select all
       └─ delete(id) → db.delete().where(eq(problems.id, id))

Migration: drizzle-kit generate → drizzle/0000_*.sql → auto-apply lúc runtime
```

## Important Components

- `packages/database/src/schema.ts` — định nghĩa bảng `problems`.
- `packages/database/src/client.ts` — tạo kết nối SQLite, drizzle instance, auto-migrate.
- `packages/database/src/index.ts` — `ProblemDatabase` class, singleton `problemDb`.
- `packages/database/drizzle.config.ts` — cấu hình drizzle-kit.
- `packages/database/drizzle/0000_init.sql` — migration đầu tiên (khởi tạo + seed).
- `packages/database/data/` — nơi chứa DB file (`leetcode.db`, bị git ignore).

## Entry Points

- `packages/database/src/index.ts` (export `problemDb`)

## Related Files

- `packages/problem-engine/src/index.ts` (gọi `problemDb.add` trong `register`).

## Notes

- Database file nằm tại `packages/database/data/leetcode.db` (bị git ignore, chỉ `.gitkeep` được track).
- Auto-migrate chạy mỗi khi package `@leetcode/database` được import → không cần chạy lệnh riêng.
- CLI migration optional: `pnpm --filter=@leetcode/database db:migrate`.
- Server hiện chưa dùng database để đọc; chỉ `problem-engine` ghi (fire-and-forget).
- Mục tiêu README đề cập: in-memory → SQLite → PostgreSQL.