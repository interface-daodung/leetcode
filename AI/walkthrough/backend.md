# Backend Walkthrough

> Tài liệu này sẽ được bổ sung dựa trên implementation thực tế.

## Overview

`apps/server` là API server Fastify 4, chạy trên port 3000. Dữ liệu problem được đọc từ in-memory registry (`@leetcode/problem-engine`), không phải từ SQLite.

## Flow

```text
apps/server/src/index.ts (Fastify, logger: true)
  ├─ GET /health
  │    └─ trả { status: "ok", timestamp }
  ├─ GET /api/problems/:id
  │    ├─ zod: z.object({ id: z.string().transform(Number) })
  │    ├─ engine.get(id)
  │    └─ 404 nếu không tồn tại
  ├─ GET /api/problems/random/:difficulty?
  │    ├─ zod: difficulty ∈ { easy, medium, hard } (optional)
  │    └─ engine.getRandom(difficulty)
  ├─ POST /api/problems/:id/run
  │    ├─ body: { code: string }
  │    ├─ new Function("return " + code)() → solution
  │    ├─ engine.runTests(id, solution) → { passed, total }
  │    └─ 400 nếu code không hợp lệ
  └─ POST /api/problems/:id/hint
       ├─ body: { code: string }
       └─ ai.getHint(id, code) → placeholder response

app.listen({ port: 3000, host: "0.0.0.0" })
```

## Important Components

- `index.ts` — toàn bộ Fastify routes.
- `engine` (singleton từ `@leetcode/problem-engine`) — nguồn dữ liệu problem.
- `getHint` từ `@leetcode/ai` — placeholder.

## Entry Points

- `apps/server/src/index.ts`

## Related Files

- `packages/problem-engine/src/index.ts` — `ProblemEngine`, `runTests`.
- `packages/shared/src/index.ts` — `ProblemMeta`, `Difficulty`.
- `packages/ai/src/index.ts` — `getHint`.

## Notes

- Dữ liệu đến từ in-memory registry; để API có dữ liệu, cần chạy seed trước (hoặc trong process) để `engine.register(...)` được gọi.
- Database (SQLite) chưa được dùng làm nguồn đọc cho API.
