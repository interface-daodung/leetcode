# Plan: feat/docker-build

## Goal

Single `docker compose up` từ root → build toàn bộ monorepo (apps + packages), chạy Fastify server trên port 3000 phục vụ cả API + web SPA (apps/web/dist serve qua `@fastify/static` + SPA fallback). Không cần nginx, không cần vite dev server, không bundle source code vào image runtime.

## Out of scope

- `apps/extension` (MV3 extension) — không Docker, user load unpacked thủ công.
- `apps/admin` (Angular) — không build, không phục vụ.
- `docs/`, `AI/`, `graphify-out/` — không vào image.

## Approach

### Build artifact layout (sau build)

```text
apps/server/dist/                     # tsc emit (apps/server/package.json: build = tsc)
apps/web/dist/                        # vite build + assets
packages/{shared,database,problem-engine,ai}/dist/   # tsc emit (override --noEmit)
packages/database/drizzle/            # SQL migrations (cần cho migrate())
packages/database/data/               # assets/ + leetcode.db (volume mount được)
```

### Tại `4788ae2`, các package (shared/database/problem-engine/ai) đang dùng:

```jsonc
{
  "main": "src/index.ts",
  "types": "src/index.ts",
  "build": "tsc --noEmit"
}
```

→ Khi `apps/server/dist/index.js` resolve `@leetcode/shared` qua workspace, Node load file `.ts` thất bại (thiếu `tsx`). Phải:

1. Build stage chạy `tsc` (không `--noEmit`) cho 4 package → emit `dist/index.js` + `dist/index.d.ts`.
2. Patch `package.json` của 4 package: `main` → `dist/index.js`, `types` → `dist/index.d.ts`.
3. Runtime image chỉ copy `dist/` + `package.json` đã patch, bỏ `src/`.

### Server serve SPA

Thêm `apps/server/src/plugins/web-spa.ts` đăng ký `@fastify/static` cho `apps/web/dist` với `wildcard: false` + SPA fallback: nếu request không match `/api/*`, `/health`, `/ws/*`, `/assets/*`, trả `index.html`. Không xung đột vì `@fastify/static` chạy trước route đăng ký.

### Docker network

- Container chạy `HOST=0.0.0.0 PORT=3000` — bind all interface, truy cập từ host qua `localhost:3000`.
- CORS plugin đã có sẵn, không cần đổi.

## Files added

```text
Dockerfile                   # multi-stage: deps + builder + runtime
docker-compose.yml           # 1 service web+api
.dockerignore                # chỉ cho phép file cần build + runtime
.docker-env                  # mẫu env cho container (copy thành .env.docker.local)
README.docker.md             # hướng dẫn 1 lệnh up
scripts/docker-build.mjs     # patch package.json#main/types + tsc build (build stage)
```

## Files modified

```text
apps/server/src/config.ts                                    # thêm WEB_DIST_ROOT
apps/server/src/plugins/web-spa.ts                           # NEW: serve SPA
apps/server/src/app.ts                                       # đăng ký web-spa
.gitignore                                                   # .env.docker.local
```

## Tasks

1. ✅ Tạo nhánh `feat/docker-build` từ `4788ae2` qua worktree `../docker-build`.
2. ⬜ Viết `Dockerfile` multi-stage.
3. ⬜ Viết `docker-compose.yml`.
4. ⬜ Viết `.dockerignore` + `.docker-env`.
5. ⬜ Viết `scripts/docker-build.mjs` patch main/types + tsc build.
6. ⬜ Thêm `apps/server/src/plugins/web-spa.ts` + đăng ký trong `app.ts`.
7. ⬜ Viết `README.docker.md`.
8. ⬜ Smoke test local: `docker compose up --build` → `curl :3000/api/problems` 200, `curl :3000/` trả HTML index.
9. ⬜ Commit + update `AI/STATUS.md` + `AI/history/2026-09/docker-build.md`.

## Rollback

Branch local `feat/docker-build`, không push. Nếu fail → `git checkout master` trên worktree chính.