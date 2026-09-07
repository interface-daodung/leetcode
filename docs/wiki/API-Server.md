# API Server {#api-server}

## Tổng quan

`apps/server` — Fastify 4 API server, port 3000. Cung cấp endpoints cho problem CRUD, run code, hints, assets, playground.

> Dữ liệu problem đọc từ **in-memory registry** (`@leetcode/problem-engine`), **KHÔNG** đọc từ SQLite trực tiếp. `problemDb.add` chỉ ghi fire-and-forget khi `engine.register`.

## Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/health` | Health check → `{ status: "ok", timestamp }` |
| `GET` | `/api/problems` | Danh sách tất cả problems (từ DB, kèm hints) |
| `GET` | `/api/problems/:id` | Lấy problem theo id (404 nếu không tồn tại, kèm hints/assets) |
| `GET` | `/api/problems/random/:difficulty?` | Random problem, `difficulty ∈ {easy,medium,hard}` (optional) |
| `POST` | `/api/problems/:id/run` | Chạy test với `{ code: string }` body → `{ passed, total, problemId, results[] }` |
| `POST` | `/api/problems/:id/hint` | Lấy hint với `{ code: string }` body (placeholder) |
| `GET` | `/api/problems/:id/hints` | Lấy hints từ DB (theo thứ tự `ord`) |
| `GET` | `/api/problems/:id/assets` | Lấy assets (ảnh đã tải) từ DB |
| `POST` | `/api/playground/:slug` | Ghi `playground/<slug>.js` + trả `{ path, line, column }` để mở VS Code |
| `POST` | `/api/problems/import` | Import `ProblemClip` JSON (validate chặt, tải ảnh về local, 201/409/400) |
| `GET` | `/assets/*` | Serve ảnh đã tải từ `packages/database/data/assets/<slug>/` |

## Validation

- **Zod 3**: parse params/body thủ công (`z.object().parse(...)`), chưa dùng Fastify schema
- `POST /import`: validate strict (null check, trim, refine)

## Kiến trúc MVC / Phân Tầng

```
src/
  index.ts       # Entry: load env → createApp() → hydrate engine → listen
  app.ts         # createApp(): tạo Fastify instance, đăng ký plugins + routes
  config.ts      # Đọc env một chỗ (PORT, HOST, API_URL, ASSETS_ROOT)
  plugins/
    cors.ts      # CORS hook (onSend + OPTIONS), allow GET,POST,PUT,OPTIONS
    static.ts    # @fastify/static cho /assets/*
  routes/        # Chỉ khai báo method + path (health, problems, index prefix /api)
  controllers/   # Zod validate + quyết định status/shape response, KHÔNG truy cập DB
  services/      # Logic nghiệp vụ:
    problem.service.ts  # hydrate, list, getById, run, hint, getHints, getAssets, exists, importClip
    asset.service.ts    # downloadAndRewriteImages (từ src/assets.ts cũ)
```

Dependency injection đơn giản qua constructor/factory (service nhận `ProblemDatabase` + engine, controller nhận service) — không dùng thư viện DI.

## Run Code Flow

```
POST /api/problems/:id/run
  ├─ solution.util.stripComments(code)
  ├─ extractSolutionFunction(code)  // trích hàm giải duy nhất
  ├─ wrapSolution(fn, inputs)       // spread input → solution function
  ├─ engine.runTestsDetailed(id, solution)
  └─ Trả { passed, total, problemId, results[] }
       results: { input, expected, actual, ok, error }[]
```

> `runTestsDetailed` dùng `new Function("return " + solutionCode)` — thiết kế có chủ đích, không phải bug.

## Import Flow (POST /api/problems/import)

```
1. Validate ProblemClip (Zod strict)
2. Tạo problem trong engine (để có id cho FK)
3. downloadAndRewriteImages(description, slug, API_URL, problemId)
   ├─ Extract <img src> via regex
   ├─ Mỗi src (bỏ qua data: và /assets/):
   │   ├─ fetch → Buffer (timeout 15s)
   │   ├─ SHA-256 hash
   │   ├─ DB findAssetByHash → nếu trùng reuse localPath
   │   ├─ Nếu mới: sanitizeFilename → writeFile vào assets/<slug>/{name}
   │   │   (trùng tên khác hash → thêm -${hash.slice(0,8)})
   │   └─ Rewrite description src → ${API_URL}/assets/<relativePath>
   └─ DB addAsset per-problem (FK cascade)
4. updateDescription(engine, id, newDescription)
5. Trả 201 (created) hoặc 409 (duplicate id) hoặc 400 (invalid)
```

## Assets & Dedupe

- Lưu ảnh local: `packages/database/data/assets/<slug>/{name}`
- Dedupe toàn cục qua `hash` (SHA-256) trong bảng `problem_assets`
- Serve qua `@fastify/static` tại `GET /assets/*`
- Cần `ensureAssetFiles` (tải lại file thiếu lúc hydrate/getById)

## Hydrate Engine

Khởi động server:
```
1. DB getAllWithHints()
2. Với mỗi problem: engine.register(problem) → problemDb.add fire-and-forget
```

## CORS

- `plugins/cors.ts`: `onSend` hook + `app.options("/*", ...)`
- `Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS`
- `Access-Control-Allow-Origin: *` (dev), `Access-Control-Allow-Headers: Content-Type`

## Build & Test

```bash
pnpm --filter=@leetcode/server build   # tsc → dist/
pnpm --filter=@leetcode/server test    # Vitest (42 tests)
pnpm --filter=@leetcode/server lint    # ESLint (src --ext .ts)
```

## Ghi chú

- Chưa có: auth, middleware tập trung, error handler tập trung, WebSocket
- Để API có dữ liệu: cần `engine.register(...)` được gọi (seed đã bỏ)
- `playground/` folder bị `.gitignore`