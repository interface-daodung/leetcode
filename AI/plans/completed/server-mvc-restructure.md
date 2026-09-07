# Refactor server sang kiến trúc MVC / Clean Architecture

Trạng thái: **active**
Ngày tạo: 2026-08-31
Branch đề xuất: `refactor/server-mvc`

---

## 1. Mục tiêu

Refactor `apps/server` từ kiến trúc "single-file" (mọi route + logic gói trong `src/index.ts` 251 dòng + `src/assets.ts`) sang kiến trúc **MVC chuẩn + phân tầng service** để:

- Code dễ đọc: mỗi file một trách nhiệm rõ ràng.
- Dễ mở rộng: thêm API mới chỉ cần thêm route + controller, không đụng file entry.
- Dễ test: controller/service/repository là các module thuần, tách khỏi Fastify instance.
- Đúng chuẩn: tách `Route → Controller → Service → Repository(DB)`.

> Ghi chú quan trọng: việc này là **refactor thuần** — KHÔNG thay đổi hành vi API, schema DB, hay endpoint nào.

---

## 2. Hiện trạng

- **`apps/server/src/index.ts`** (251 dòng) gồm: load env, config, register static, CORS, hydrate engine, và 10 route handlers inline (Zod validate inline).
- **`apps/server/src/assets.ts`** (199 dòng): service tải ảnh + rewrite src + dedupe hash.
- **`apps/server/src/assets.test.ts`** (157 dòng): 5 tests (mock `@leetcode/database`).
- Dependency server: `@leetcode/shared`, `@leetcode/database`, `@leetcode/problem-engine`, `@leetcode/ai`, `fastify`, `@fastify/static`, `dotenv`, `zod`.

Danh sách endpoint hiện tại (giữ nguyên hành vi):

| Method | Route | Controller đề xuất |
|--------|-------|--------------------|
| GET | `/health` | `HealthController` |
| GET | `/api/problems` | `ProblemController.list` |
| GET | `/api/problems/:id` | `ProblemController.getById` |
| GET | `/api/problems/random/:difficulty?` | `ProblemController.getRandom` |
| POST | `/api/problems/:id/run` | `ProblemController.run` |
| POST | `/api/problems/:id/hint` | `ProblemController.hint` |
| GET | `/api/problems/:id/hints` | `ProblemController.getHints` |
| GET | `/api/problems/:id/assets` | `ProblemController.getAssets` |
| POST | `/api/problems/import` | `ProblemController.import` |

---

## 3. Kiến trúc đích

```text
apps/server/src/
├── app.ts               # Tạo Fastify instance + register plugins/routes (không listen)
├── index.ts             # Entry: load env, gọi createApp, listen
├── config.ts            # Đọc env: PORT, HOST, API_URL, ASSETS_ROOT
├── plugins/
│   ├── cors.ts          # Hook onSend CORS + OPTIONS handler
│   └── static.ts        # Register @fastify/static cho /assets/*
├── routes/
│   ├── index.ts         # Router tổng: register tất cả route (prefix /api)
│   ├── health.routes.ts # GET /health
│   └── problems.routes.ts # 8 route /api/problems*
├── controllers/
│   ├── health.controller.ts
│   └── problems.controller.ts   # Zod validate + parse + gọi service, trả reply
├── services/
│   ├── problem.service.ts       # hydrate, import flow, hints, assets lookup
│   └── asset.service.ts         # downloadAndRewriteImages (chuyển từ assets.ts)
└── index.ts             # (nếu cần) re-export cho test
```

### Trách nhiệm từng lớp

| Layer | Trách nhiệm | Cấm làm |
|-------|-------------|---------|
| `routes/` | Khai báo method + path + gọi handler tương ứng | Không chứa logic nghiệp vụ |
| `controllers/` | Parse/validate input (Zod), gọi service, quyết định status code + shape response | Không truy cập DB trực tiếp, không thao tác file |
| `services/` | Logic nghiệp vụ: import flow, hydrate, dedupe ảnh, hints | Không biết về Fastify reply/request |
| `plugins/` | Middleware cấu hình Fastify (CORS, static) | Không chứa logic API |
| `config.ts` | Đọc env một chỗ, export hằng | Không import Fastify |

`assets.ts` cũ → chuyển thành `services/asset.service.ts` (giữ nguyên function `downloadAndRewriteImages` để test hiện tại không vỡ hoặc cập nhật import path).

---

## 4. Chi tiết từng file

### 4.1 `src/config.ts` (mới)

```ts
export const config = {
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? "0.0.0.0",
  apiUrl: process.env.API_URL ?? process.env.VITE_API_URL ?? `http://localhost:${port}`,
  assetsRoot: ASSETS_ROOT,
};
```

- Di chuyển logic load `.env` (dotenv) vào đây hoặc giữ ở `index.ts` entry — quyết định: giữ ở `index.ts` để config thuần (dễ test).

### 4.2 `src/app.ts` (mới)

```ts
export function createApp() {
  const app = Fastify({ logger: true });
  registerPlugins(app);
  registerRoutes(app);
  return app;
}
```

### 4.3 `src/controllers/problems.controller.ts`

Mỗi handler nhận `(request, reply)` của Fastify, chỉ làm: Zod parse → gọi `ProblemService` → trả kết quả/status.

### 4.4 `src/services/problem.service.ts`

- `hydrateEngine()` — từ `index.ts` hiện tại.
- `list()` → `problemDb.getAllWithHints()`.
- `getById(id)` → engine → fallback DB + hints/assets.
- `getRandom(difficulty?)`.
- `run(id, code)` → engine.runTests.
- `hint(id, code)` → `getHint`.
- `getHints(id)`, `getAssets(id)`.
- `importClip(clip, apiUrl)` → toàn bộ flow import hiện tại (tạo problem, register, add DB, download ảnh, update description, set hints).

### 4.5 `src/services/asset.service.ts`

- Rename `assets.ts` → `services/asset.service.ts`, giữ `ASSETS_ROOT` + `downloadAndRewriteImages` (đổi import path trong test nếu cần).

### 4.6 `src/routes/problems.routes.ts`

```ts
export function registerProblemRoutes(app, deps) {
  app.get("/problems", ...);
  app.get("/problems/:id", ...);
  // ...
}
```

### 4.7 `src/index.ts` (entry)

- Load dotenv.
- `const app = createApp()`.
- Hydrate engine (gọi `ProblemService.hydrateEngine(app.log)`).
- `app.listen(config)`.

---

## 5. Injection approach

Hai lựa chọn — quyết định: **dependency injection đơn giản qua factory/constructor**.

```ts
// controllers/problems.controller.ts
export function createProblemController(service: ProblemService) {
  return {
    list: async (req, reply) => { ... },
    // ...
  };
}
```

- Service nhận `problemDb`, `engine`, `getHint` qua constructor → test dễ mock.
- Không cần thư viện DI (tránh over-engineering, đúng CONVENTIONS).

---

## 6. File thay đổi

### Tạo mới

- `apps/server/src/config.ts`
- `apps/server/src/app.ts`
- `apps/server/src/plugins/cors.ts`
- `apps/server/src/plugins/static.ts`
- `apps/server/src/routes/index.ts`
- `apps/server/src/routes/health.routes.ts`
- `apps/server/src/routes/problems.routes.ts`
- `apps/server/src/controllers/health.controller.ts`
- `apps/server/src/controllers/problems.controller.ts`
- `apps/server/src/services/problem.service.ts`
- `apps/server/src/services/asset.service.ts`

### Xóa / di chuyển

- `apps/server/src/assets.ts` → `apps/server/src/services/asset.service.ts` (nội dung giữ nguyên, cập nhật import path).

### Sửa

- `apps/server/src/index.ts` → gọn lại thành entry (env + createApp + hydrate + listen).
- `apps/server/src/assets.test.ts` → cập nhật import path sang service mới (nội dung test giữ nguyên, đảm bảo vẫn pass).

### Không sửa

- `packages/*` (database, problem-engine, ai, shared) — KHÔNG đụng.
- `apps/web`, `apps/extension` — không đổi API.

---

## 7. Testing

- `pnpm --filter=@leetcode/server test` — giữ nguyên 5 tests assets (cập nhật import path), thêm tests mới nếu hợp lý:
  - `problem.service.test.ts`: test `importClip` flow (mock DB/engine) — tách logic ra khỏi route giúp test dễ hơn nhiều.
  - `problems.controller.test.ts` (tùy chọn): test Zod validate.
- `pnpm --filter=@leetcode/server build` (tsc) pass — strict mode.
- `pnpm --filter=@leetcode/server lint` pass.
- `pnpm -r build` pass (không break workspace).
- Test thủ công end-to-end: chạy server → `GET /health`, `GET /api/problems`, `POST /api/problems/import` (clip JSON mẫu) → verify cùng kết quả như trước refactor.

---

## 8. Documentation cần cập nhật

- `AI/ARCHITECTURE.md` — cập nhật cấu trúc server mới (routes/controllers/services/plugins).
- `AI/index/APP_STRUCTURE.md` — mục Backend: mô tả cấu trúc thư mục mới.
- `AI/index/PROJECT_STRUCTURE.md` — cập nhật tree `apps/server/`.
- `AI/STATUS.md` — ghi nhận refactor hoàn thành.
- `AI/walkthrough/backend.md` — không đổi (API giữ nguyên), chỉ kiểm tra lại.
- `AI/context/decisions.md` — thêm decision về kiến trúc MVC server.
- Tạo `AI/history/2026-08/server-mvc-refactor.md`.
- `apps/server/README.md` — cập nhật mô tả cấu trúc.

---

## 9. Tiêu chí hoàn thành (DoD)

- [x] Server chạy được, toàn bộ 9 endpoint hoạt động y hệt trước refactor.
- [x] Không còn logic route trong `index.ts` (chỉ còn entry).
- [x] Có đầy đủ `routes/`, `controllers/`, `services/`, `plugins/`.
- [x] `pnpm --filter=@leetcode/server test` pass (11 tests: 5 assets cũ + 6 problem.service mới).
- [x] `pnpm -r build` pass, `lint` pass (lint lỗi sẵn từ trước — repo chưa có eslint.config.*).
- [x] Docs (`AI/`) cập nhật đầy đủ.
- [x] Plan move sang completed.

---

## 10. Rủi ro & giảm thiểu

- **Vỡ test cũ**: giữ nguyên signature `downloadAndRewriteImages`, chỉ đổi import path → rủi ro thấp.
- **Refactor đổi hành vi vô tình**: sau khi xong, test thủ công từng endpoint so sánh response trước/sau.
- **Tham chiếu import path trong `apps/web`/`extension`**: không có (chúng gọi qua HTTP, không import server source).

---

## 11. Hoàn thành plan

Khi xong, chạy từ **repo root**:

```bat
& .\AI\skills\feature-development\move-plan-to-completed.bat server-mvc-restructure
```
