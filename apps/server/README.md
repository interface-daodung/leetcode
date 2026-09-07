# @leetcode/server

Fastify API server cho LeetCode Lab.

## Tính năng

- `GET /health` — health check
- `GET /api/problems` — danh sách problems
- `GET /api/problems/:id` — lấy problem theo id (kèm hints/assets)
- `GET /api/problems/random/:difficulty?` — random problem
- `POST /api/problems/:id/run` — chạy test với code
- `POST /api/problems/:id/hint` — lấy hint (placeholder)
- `GET /api/problems/:id/hints` — lấy hints từ DB
- `GET /api/problems/:id/assets` — lấy assets từ DB
- `POST /api/problems/import` — import ProblemClip JSON (201/409/400)
- `GET /assets/*` — serve ảnh đã tải (static)

## Kiến trúc

Server được tổ chức theo **MVC / phân tầng** (refactor `2026-08-31`):

```text
apps/server/src/
├── index.ts               # Entry: env + createApp + hydrate + listen
├── app.ts                 # createApp(): tạo Fastify instance, đăng ký plugin & route
├── config.ts              # Đọc env một chỗ (PORT, HOST, API_URL, ASSETS_ROOT)
├── plugins/
│   ├── cors.ts            # CORS onSend hook + OPTIONS
│   └── static.ts          # @fastify/static cho /assets/*
├── routes/
│   ├── index.ts           # Router tổng (prefix /api)
│   ├── health.routes.ts
│   └── problems.routes.ts
├── controllers/
│   ├── health.controller.ts
│   └── problems.controller.ts   # Zod validate + trả status/shape response
└── services/
    ├── problem.service.ts       # Logic nghiệp vụ: hydrate, import flow, run, hints
    └── asset.service.ts         # downloadAndRewriteImages (SHA-256 dedupe DB)
```

Nguyên tắc:

- `routes/` chỉ khai báo method + path → gọi controller.
- `controllers/` validate (Zod) + quyết định status code, KHÔNG truy cập DB.
- `services/` chứa logic nghiệp vụ, KHÔNG biết về Fastify reply/request.
- Thêm API mới: thêm route + controller, không phải sửa entry.

## Chạy

```bash
pnpm --filter=@leetcode/server dev
```

Server chạy tại `http://localhost:3000`.

## Công nghệ

- Fastify 4 (logger bật)
- Zod 3 (validation thủ công trong controller)
- Node runner: tsx

## Tài liệu

- [API Server](../../docs/features/api-server.md)

## Ghi chú

- Dữ liệu problem đọc từ in-memory registry (`@leetcode/problem-engine`), không phải SQLite.
- Chưa có auth, middleware, error handler tập trung, WebSocket.
- `pnpm --filter=@leetcode/server start` (node dist) chưa dùng được vì `packages/*` chỉ type-check, không emit dist (xem AGENTS.md).