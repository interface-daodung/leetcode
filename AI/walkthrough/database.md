# Database Walkthrough

> Tài liệu này sẽ được bổ sung dựa trên implementation thực tế.

## Overview

Database sử dụng SQLite với Drizzle ORM. Hiện tại chỉ có một bảng `problems` và migration đầu tiên đã được tạo.

## Flow

```text
Schema: packages/database/src/schema.ts
  └─ sqliteTable("problems") → Drizzle ORM

Client: packages/database/src/client.ts
  ├─ createClient({ url: "file:leetcode.db" }) → @libsql/client
  └─ drizzle(sqlite, { schema }) → db instance

CRUD: packages/database/src/index.ts
  └─ ProblemDatabase class
       ├─ add(problem) → db.insert(schema.problems).values(...).onConflictDoNothing()
       ├─ get(id) → db.select().where(eq(problems.id, id))
       ├─ getByDifficulty(difficulty) → filter by difficulty
       ├─ getAll() → select all
       └─ delete(id) → db.delete().where(eq(problems.id, id))

Migration: drizzle-kit generate → drizzle/0000_*.sql
```

## Important Components

- `packages/database/src/schema.ts` — định nghĩa bảng `problems`.
- `packages/database/src/client.ts` — tạo kết nối SQLite và drizzle instance.
- `packages/database/src/index.ts` — `ProblemDatabase` class, singleton `problemDb`.
- `packages/database/drizzle.config.ts` — cấu hình drizzle-kit.
- `packages/database/drizzle/0000_faithful_captain_britain.sql` — migration đầu tiên.

## Entry Points

- `packages/database/src/index.ts` (export `problemDb`)

## Related Files

- `packages/problem-engine/src/index.ts` (gọi `problemDb.add` trong `register`).
- `scripts/seed-problems.ts` (gọi `engine.register` → ghi vào SQLite).

## Notes

- Database file (`leetcode.db`) chưa được tạo hoặc commit.
- Server hiện chưa dùng database để đọc; chỉ `problem-engine` ghi (fire-and-forget).
- Mục tiêu README đề cập: in-memory → SQLite → PostgreSQL.