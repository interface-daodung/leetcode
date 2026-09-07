# feat/docker-build — single image Docker cho monorepo (2026-09-07)

Nhánh: `feat/docker-build` (worktree `../docker-build`, base `4788ae2`).

## Bối cảnh

- Trước đó repo chạy dev qua `pnpm dev`/`tsx watch` + Vite dev server. Không có cách nào chạy bằng 1 lệnh duy nhất không cần dev environment.
- Yêu cầu: `docker compose up` một lần → build + chạy toàn bộ (web + server), bỏ qua `apps/extension` (MV3 load unpacked) + `apps/admin` (Angular không phục vụ) + `docs/` + `AI/` + `graphify-out/`.

## Thay đổi

### Dockerfile (multi-stage)

```text
deps     → pnpm install --frozen-lockfile (cache layer chỉ manifest)
builder  → scripts/docker-build.mjs (patch packages/* + tsc) + pnpm web build + pnpm server build
runtime  → copy dist + drizzle + assets, pnpm install --prod, CMD node apps/server/dist/index.js
```

Stage `runtime` (node:20-alpine) chỉ giữ artifacts:
- `apps/server/dist/`, `apps/web/dist/`
- `packages/{shared,database,problem-engine,ai}/dist/`
- `packages/database/drizzle/` (SQL migrations cho auto-migrate runtime)
- `packages/database/data/` mount volume (DB + assets persist)
- Node_modules production-only cho server + packages (filter `--filter`).

### Build script — `scripts/docker-build.mjs`

Tại commit `4788ae2`, 4 package (`shared`, `database`, `problem-engine`, `ai`) có `"main": "src/index.ts"` + `build: "tsc --noEmit"`. Khi `apps/server/dist/index.js` resolve `@leetcode/shared` qua workspace, Node load `.ts` thất bại → `ERR_MODULE_NOT_FOUND` ở runtime.

Fix: script Node stdlib patch `package.json#main` → `dist/index.js`, `types` → `dist/index.d.ts` rồi `tsc --noEmit false --outDir dist --declaration --declarationMap --sourceMap`. Source code trong repo không đổi — chỉ build artifacts được sửa runtime. (`packages/tray-spawn` từ nhánh sau cũng sẽ tương tự khi merge.)

### SPA fallback — `apps/server/src/plugins/web-spa.ts`

Thêm plugin serve `apps/web/dist` qua `@fastify/static` (root `/`, `wildcard: false`) + `setNotFoundHandler`:

- Request `/api/*`, `/ws/*`, `/health` → 404 JSON (bảo vệ route API).
- Request khác + `Accept: text/html` → trả `index.html` (React Router xử lý route phía client).
- Request khác không có Accept HTML → 404 JSON.

Phải đăng ký **trước** `registerStatic` (`/assets/*`) và `registerRoutes` (`/api/*`). Đã smoke-test:

```text
GET /             → 200 HTML (index.html)
GET /problems/1   → 200 HTML (SPA fallback)
GET /index.html   → 200 HTML
GET /api/problems → 200 JSON
GET /api/problems/99999 → 404 {error: "Problem not found"}
GET /health       → 200 {status:"ok"}
```

### `.dockerignore`

Chỉ cho qua `Dockerfile` build context: source cần thiết (`packages/*/src`, `apps/*/src`, `tsconfig.json`, `package.json`, `pnpm-*.yaml`, `pnpm-lock.yaml`, `.npmrc`, `scripts/docker-build.mjs`).

Loại: `.git/`, `.opencode/`, `AI/`, `docs/`, `graphify-out/`, `apps/extension/`, `apps/admin/`, `node_modules/`, `dist/`, `coverage/`, `.env` (chỉ `.env.example` qua).

### `docker-compose.yml`

1 service `app` (port 3000), volume `leetcode-data` mount `/app/packages/database/data` (persist DB + assets), `healthcheck` gọi `/health`, `env_file: .env.docker` (PORT=3000, HOST=0.0.0.0, API_URL).

### `README.docker.md`

Hướng dẫn `docker compose up --build` + endpoint table + volume note + những gì không bao gồm.

### Cấu hình khác

- `apps/server/src/config.ts`: thêm `WEB_DIST_ROOT` + `WEB_DIST_AVAILABLE` (check `existsSync`, fallback warn nếu dev local chưa build web).
- `.gitignore`: thêm `**/dist/`, `.env.docker.local`.

## Verify (smoke test local trên Windows, không có Docker)

Không thể chạy Docker trên máy (không có daemon), đã verify từng phần bằng cách chạy builder steps locally:

1. `node scripts/docker-build.mjs` — pass, mỗi package emit `dist/{index.js,index.d.ts,...}`.
2. `pnpm --filter=@leetcode/web build` — pass (12s), output `apps/web/dist/index.html` + assets.
3. `pnpm --filter=@leetcode/server build` — pass (tsc emit `apps/server/dist/`).
4. `node apps/server/dist/index.js` (PORT=3300) — lên server, hydrated 3 problems từ SQLite.
5. Test endpoints: `/health` 200, `/api/problems` 200 (3 items), `/problems/1` 200 HTML (SPA fallback), `/api/problems/99999` 404 JSON, `/api/nonexistent` 404 JSON.
6. Static serve: `/index.html` 200, `/assets/...` (Vite-bundled chunk) 200.

## Giới hạn

- `apps/extension` không có trong image (load unpacked trong browser như cũ). Khi dùng thật, extension cần sync API URL về `http://localhost:3000` qua `pnpm --filter=@leetcode/extension sync:config`.
- `apps/admin` Angular không build trong Docker — chạy riêng qua `pnpm admin` nếu cần.
- Tại commit `4788ae2` chưa có `packages/tray-spawn` (nhánh `feat/tray-spawn` sau này). Khi merge về master, Dockerfile runtime filter có thể cần thêm `--filter=@leetcode/tray-spawn` nếu muốn package này cũng trong image (hiện tại tray-spawn chỉ dùng dev).
- `pnpm install --prod` runtime sẽ skip `better-sqlite3` postinstall (native build). Project không depend `better-sqlite3` (dùng `@libsql/client`); đã ignore-scripts toàn cục.

## Ghi chú

- Image runtime ước tính ~150 MB (node:20-alpine base + workspace deps). Không có devDeps, không có source code.
- Cache mount `--mount=type=cache,id=pnpm-store` cho pnpm store giữa các lần build (BuildKit syntax `1.7`).
- Rollback: branch local `feat/docker-build`, không push. Nếu hủy → `git checkout master` trên worktree chính + xóa `../docker-build`.