# API Server {#api-server}

## Giới thiệu {#gioi-thieu}

`apps/server` là API server dùng **Fastify 4**, chạy trên port 3000. Cung cấp endpoints để lấy problem, lấy random problem, chạy code và lấy hint.

> Dữ liệu problem được đọc từ in-memory registry (`@leetcode/problem-engine`), **không phải** từ SQLite.

## Endpoints {#endpoints}

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/health` | Health check, trả `{ status: "ok", timestamp }` |
| `GET` | `/api/problems/:id` | Lấy problem theo id (404 nếu không tồn tại) |
| `GET` | `/api/problems/random/:difficulty?` | Random problem, `difficulty ∈ { easy, medium, hard }` (optional) |
| `POST` | `/api/problems/:id/run` | Chạy test với `{ code: string }` trong body |
| `POST` | `/api/problems/:id/hint` | Lấy hint với `{ code: string }` trong body (placeholder) |

## Validation {#validation}

Validation bằng **Zod 3**: parse params/body thủ công (`z.object().parse(...)`), chưa dùng Fastify schema.

## Run Code Flow {#run-code}

```text
POST /api/problems/:id/run
  ├─ new Function("return " + code)() → solution
  ├─ engine.runTests(id, solution)
  └─ trả { passed, total }
```

## Ghi chú {#ghi-chu}

- Chưa có auth, middleware, error handler tập trung, WebSocket.
- Để API có dữ liệu, cần `engine.register(...)` được gọi (seed đã bị bỏ khỏi dự án).