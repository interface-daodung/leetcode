# Docker — single-image build & run

Một lệnh `docker compose up --build` từ repo root sẽ:

1. Cài toàn bộ workspace (`pnpm install --frozen-lockfile`).
2. Build 4 package (`@leetcode/shared|database|problem-engine|ai`) ra `dist/` — patch `main`/`types` sang `dist/index.js`.
3. Build `@leetcode/web` qua `vite build` → `apps/web/dist`.
4. Build `@leetcode/server` qua `tsc` → `apps/server/dist`.
5. Runtime image: chỉ copy artifacts (không source/devDeps), chạy Fastify server phục vụ cả API + web SPA.

## Yêu cầu

- Docker Engine ≥ 24, Compose v2 (`docker compose`).
- Port `3000` trống trên host (hoặc đổi qua `PORT` trong `.env.docker`).

## Lệnh

```bash
# 1. Cấu hình (tuỳ chọn)
cp .env.docker .env.docker.local   # sửa nếu cần đổi port

# 2. Build + chạy
docker compose up --build -d

# 3. Mở
curl http://localhost:3000/api/problems
open http://localhost:3000/

# 4. Log
docker compose logs -f app

# 5. Dừng + xoá
docker compose down            # giữ volume data
docker compose down -v         # xoá volume (mất DB + assets)
```

## Endpoint

| URL                              | Mô tả                          |
| -------------------------------- | ------------------------------ |
| `http://localhost:3000/`         | Web SPA (apps/web/dist)         |
| `http://localhost:3000/api/...`  | REST API (Fastify)              |
| `http://localhost:3000/health`   | Health check                    |
| `http://localhost:3000/ws/ai`    | WebSocket AI guide             |
| `http://localhost:3000/assets/...` | Ảnh import từ extension        |

## Volume

`leetcode-data` volume mount vào `/app/packages/database/data` — chứa `leetcode.db` + `assets/`. Mất container không mất data.

## Không bao gồm

- `apps/extension` (MV3) — load unpacked trong browser.
- `apps/admin` (Angular) — không phục vụ.
- `docs/`, `AI/`, `graphify-out/` — không vào image.

## Thay đổi code → rebuild

```bash
docker compose up --build app    # chỉ rebuild service `app`
```