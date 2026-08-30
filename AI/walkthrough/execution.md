# Execution Flow

> Tài liệu này sẽ được bổ sung dựa trên implementation thực tế.

## Overview

Execution flow tổng thể từ seed data, khởi động server, đến frontend và run code.

## Flow

```text
1. Seed
   pnpm --filter=@leetcode/server tsx scripts/seed-problems.ts
   └─ engine.register(problem)
        ├─ lưu vào in-memory Map
        └─ (void) problemDb.add(problem) → SQLite

2. Run server
   pnpm --filter=@leetcode/server dev
   └─ apps/server/src/index.ts
        └─ Fastify app.listen(port 3000)

3. Run web
   pnpm dev
   └─ apps/web (Vite dev server, port 5173)

4. API call
   GET /api/problems/1
   └─ engine.get(1) → trả problem từ in-memory

5. Run code
   POST /api/problems/1/run { code: "function(nums, target) { ... }" }
   └─ new Function("return " + code)() → solution function
   └─ engine.runTests(1, solution) → { passed, total }

6. Get hint
   POST /api/problems/1/hint { code: "..." }
   └─ ai.getHint(1, code) → placeholder response
```

## Important Components

- `scripts/seed-problems.ts` — khởi tạo data.
- `apps/server/src/index.ts` — xử lý request.
- `packages/problem-engine/src/index.ts` — registry và test runner.
- `packages/ai/src/index.ts` — hint placeholder.

## Entry Points

- Seed: `scripts/seed-problems.ts`
- Server: `apps/server/src/index.ts`
- Web: `apps/web/src/main.tsx`

## Related Files

- Tất cả file trong `packages/` và `apps/`

## Notes

- Web hiện chạy code cục bộ, không gọi API server. Có hai execution flow riêng biệt.
- Cần chạy seed trước khi server có dữ liệu.