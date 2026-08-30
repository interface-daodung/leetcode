# @leetcode/server

Fastify API server cho LeetCode Lab.

## Tính năng

- `GET /health` — health check
- `GET /api/problems/:id` — lấy problem theo id
- `GET /api/problems/random/:difficulty?` — random problem
- `POST /api/problems/:id/run` — chạy test với code
- `POST /api/problems/:id/hint` — lấy hint (placeholder)

## Chạy

```bash
pnpm --filter=@leetcode/server dev
```

Server chạy tại `http://localhost:3000`.

## Công nghệ

- Fastify 4 (logger bật)
- Zod 3 (validation thủ công)
- Node runner: tsx

## Tài liệu

- [API Server](../../docs/features/api-server.md)

## Ghi chú

- Dữ liệu problem đọc từ in-memory registry (`@leetcode/problem-engine`), không phải SQLite.
- Chưa có auth, middleware, error handler tập trung, WebSocket.