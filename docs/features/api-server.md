# API Server {#api-server}

## Giới thiệu {#gioi-thieu}

`apps/server` là API server dùng **Fastify 4**, chạy trên port 3000. Cung cấp endpoints để lấy problem, lấy random problem, chạy code và lấy hint.

> Dữ liệu problem được đọc từ in-memory registry (`@leetcode/problem-engine`), **không phải** từ SQLite.

## Endpoints {#endpoints}

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/health` | Health check, trả `{ status: "ok", timestamp }` |
| `GET` | `/api/problems` | Danh sách tất cả problems (từ DB, kèm hints) |
| `GET` | `/api/problems/:id` | Lấy problem theo id (404 nếu không tồn tại, kèm hints/assets) |
| `GET` | `/api/problems/random/:difficulty?` | Random problem, `difficulty ∈ { easy, medium, hard }` (optional) |
| `POST` | `/api/problems/:id/run` | Chạy test với `{ code: string }` trong body, trả `{ passed, total, results }` |
| `POST` | `/api/problems/:id/hint` | Lấy hint với `{ code: string }` trong body (placeholder) |
| `GET` | `/api/problems/:id/hints` | Lấy hints từ DB (theo thứ tự `ord`) |
| `GET` | `/api/problems/:id/assets` | Lấy assets (ảnh đã tải) từ DB |
| `POST` | `/api/playground/:slug` | Ghi `playground/<slug>.js` + trả `{ path, line, column }` để mở VS Code |
| `POST` | `/api/problems/import` | Import `ProblemClip` JSON (validate chặt, tải ảnh về local, 201/409/400) |
| `GET` | `/assets/*` | Serve ảnh đã tải từ `packages/database/data/assets/<slug>/` |

## Validation {#validation}

Validation bằng **Zod 3**: parse params/body thủ công (`z.object().parse(...)`), chưa dùng Fastify schema.

## Kiến trúc MVC {#kien-truc-mvc}

Server tổ chức theo MVC / phân tầng (xem `apps/server/README.md`): `routes/` (khai báo path) → `controllers/` (validate + trả response) → `services/` (logic nghiệp vụ, gồm `problem.service` và `asset.service`) → `plugins/` (CORS, static). Entry `index.ts` chỉ load env + `createApp()` + hydrate + listen.

## Run Code Flow {#run-code}

```text
POST /api/problems/:id/run
  ├─ lọc comment (solution.util.stripComments)
  ├─ trích hàm giải duy nhất (extractSolutionFunction)
  ├─ wrapSolution (spread input) → solution
  ├─ engine.runTestsDetailed(id, solution)
  └─ trả { passed, total, problemId, results } (results: per-case input/expected/actual/ok/error)
```

## Ghi chú {#ghi-chu}

- Chưa có auth, middleware, error handler tập trung, WebSocket.
- Để API có dữ liệu, cần `engine.register(...)` được gọi (seed đã bị bỏ khỏi dự án).