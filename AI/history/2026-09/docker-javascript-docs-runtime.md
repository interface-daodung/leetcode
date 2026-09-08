# fix(docker): javascript-docs thiếu runtime package (2026-09-08)

## Triệu chứng

`docker compose up --build` build image OK nhưng server crash khi boot:

```
Error: Cannot find package '/app/apps/server/node_modules/@leetcode/javascript-docs/index.js'
imported from /app/apps/server/dist/services/docs.service.js  (ERR_MODULE_NOT_FOUND)
```

## Root cause

Feature `docs-db` (2026-09-07) thêm `@leetcode/javascript-docs` vào `dependencies` của
`apps/server` + `packages/database`, nhưng image Docker không có package này ở runtime:

1. Stage `prod-deps` cài `--filter=@leetcode/server...` — pnpm tạo symlink
   `apps/server/node_modules/@leetcode/javascript-docs -> packages/javascript-docs`,
   nhưng Dockerfile không copy `packages/javascript-docs/package.json` vào stage này
   → `/app/packages/javascript-docs` chỉ còn `src/` (copy data/docs ở runtime stage).
2. `scripts/docker-build.mjs` chỉ patch main + tsc emit cho
   `["shared", "database", "problem-engine", "ai"]` — thiếu `javascript-docs`
   → không có `dist/` để Node ESM resolve (`main` gốc là `src/index.ts`).
3. Runtime stage cũng không copy `dist/`.

pnpm cài OK ở builder vì Node load qua tsx/vite (đọc `src/index.ts`), nên build không báo lỗi.

## Fix

- `scripts/docker-build.mjs`: thêm `"javascript-docs"` vào list packages (patch main/types + tsc emit dist).
- `Dockerfile`:
  - prod-deps: `COPY --from=builder /repo/packages/javascript-docs/package.json packages/javascript-docs/package.json`
  - runtime: `COPY --from=builder /repo/packages/javascript-docs/dist packages/javascript-docs/dist`

## Verify

- `docker compose up --build` → container healthy.
- `/api/docs/file/notes?lang=vi` 200 (55KB), `/api/docs/search?q=array` 200,
  `/api/problems` 200, SPA `/` 200.
- Commit `0aef3d4` trên `feat/docs-db`.

## Bài học

Khi thêm workspace package làm dependency của app được build vào Docker:
cập nhật cả 3 chỗ — list package trong `scripts/docker-build.mjs`,
`COPY package.json` stage prod-deps, `COPY dist` stage runtime.
