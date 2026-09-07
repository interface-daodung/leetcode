# Server refactor sang MVC / phân tầng

Ngày: 2026-08-31
Nhánh: `refactor/server-mvc`

## Mục tiêu

Refactor `apps/server` từ kiến trúc single-file (mọi route + logic gói trong `src/index.ts` 251 dòng + `src/assets.ts`) sang MVC / clean architecture để dễ đọc, dễ mở rộng, dễ test. Refactor thuần — không đổi hành vi API, schema DB hay package khác.

## Thay đổi

### Cấu trúc mới

```text
apps/server/src/
├── index.ts               # Entry: env + createApp({service}) + hydrate + listen (~25 dòng)
├── app.ts                 # createApp(): Fastify instance + plugins + routes (async, injectable service)
├── config.ts              # Đọc env một chỗ (PORT, HOST, API_URL, ASSETS_ROOT)
├── plugins/
│   ├── cors.ts            # onSend hook CORS + OPTIONS handler
│   └── static.ts          # @fastify/static cho /assets/*
├── routes/
│   ├── index.ts           # Router tổng (register /api prefix cho problems, health không prefix)
│   ├── health.routes.ts
│   └── problems.routes.ts
├── controllers/
│   ├── health.controller.ts
│   └── problems.controller.ts   # Zod validate + trả status/shape response
└── services/
    ├── problem.service.ts       # hydrate, list, getById, getRandom, run, hint, getHints, getAssets, exists, importClip
    ├── problem.service.test.ts  # 6 tests mới (mock DB + engine)
    └── asset.service.ts         # downloadAndRewriteImages (từ assets.ts cũ, giữ nguyên)
```

### Chi tiết

- `ProblemService` (class, constructor nhận `ProblemDatabase` + engine để dễ mock): gom toàn bộ logic nghiệp vụ trước đây nằm trong route handler.
- `ProblemService.run` trả discriminated union `RunOutcome` (`ok: true` | `reason: "not-found"` | `reason: "invalid-code"`) → controller map sang 200/404/400.
- `importSchema` (Zod) chuyển từ `index.ts` sang `controllers/problems.controller.ts`.
- `ProblemService.importClip` giữ nguyên flow: register → add DB → `downloadAndRewriteImages` → `updateDescription` → `setHints`.
- `createApp` injectable service → test controller/app độc lập sau này.
- Xóa `apps/server/src/assets.ts` (chuyển nội dung sang `services/asset.service.ts`, `ASSETS_ROOT` import từ `config.ts`).
- `apps/server/src/assets.test.ts` đổi import path `./assets.js` → `./services/asset.service.js` (5 tests giữ nguyên).

## Kết quả

- `pnpm --filter=@leetcode/server test` → 11 passed (5 assets cũ + 6 problem.service mới).
- `pnpm --filter=@leetcode/server build` (tsc strict) pass.
- `pnpm -r build` pass (9 projects, không break web/extension/package).
- Smoke-test runtime (tsx): `GET /health` ok, `GET /api/problems` list 5, `POST /api/problems/import` → 201 (id mới, hints kèm), `POST /:id/run` → 200, import trùng → 409. Hành vi y hệt trước refactor.
- Lint server chưa chạy được (repo chưa có `eslint.config.*`) — vấn đề có sẵn, không do refactor.

## Lệnh tham chiếu

```bash
pnpm --filter=@leetcode/server test   # 11
pnpm --filter=@leetcode/server build
pnpm -r build
```

## Ghi chú

- `pnpm --filter=@leetcode/server start` (node dist) chưa dùng được vì `packages/*` chỉ type-check không emit — pre-existing, không phải do refactor.
