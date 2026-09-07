# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────
# LeetCode monorepo — single image build + runtime
# Stage 1: deps   — pnpm install với lockfile (cache toàn workspace)
# Stage 2: builder — build packages + apps/web (vite) + apps/server (tsc)
# Stage 3: runtime — chỉ copy artifacts, không source/devDeps
# ─────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=22-alpine
ARG PNPM_VERSION=11.24.0

# ─── deps ────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS deps
ARG PNPM_VERSION
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Copy chỉ manifest để cache layer tối đa
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc* ./
COPY packages/shared/package.json          packages/shared/
COPY packages/database/package.json        packages/database/
COPY packages/problem-engine/package.json  packages/problem-engine/
COPY packages/ai/package.json              packages/ai/
COPY packages/javascript-docs/package.json packages/javascript-docs/
COPY apps/server/package.json              apps/server/
COPY apps/web/package.json                 apps/web/
COPY apps/admin/package.json               apps/admin/

# Cài full workspace (giữ devDeps vì cần typescript build)
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ─── builder ─────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /repo

# Copy source code
COPY tsconfig.json ./
COPY scripts/ scripts/
COPY packages/ packages/
COPY apps/ apps/

# 1) Build các package (override --noEmit để emit dist/)
#    Patch main/types sau đó để Node runtime load .js (không cần tsx)
RUN node scripts/docker-build.mjs

# 2) Build web SPA (vite output ra apps/web/dist)
RUN pnpm --filter=@leetcode/web build

# 3) Build admin SPA (Angular 18 application builder → apps/admin/dist/admin/browser)
RUN pnpm --filter=@leetcode/admin build

# 4) Build server (tsc emit apps/server/dist)
RUN pnpm --filter=@leetcode/server build

# ─── prod-deps: cài node_modules production trong stage riêng ────────
# pnpm store + corepack cache chỉ tồn tại ở stage này, không vào layer runtime
FROM node:${NODE_VERSION} AS prod-deps
ARG PNPM_VERSION
WORKDIR /app

# Manifests ĐÃ PATCH từ builder (main → dist/index.js) — node resolve đúng lúc runtime
COPY --from=builder /repo/package.json                          package.json
COPY --from=builder /repo/pnpm-workspace.yaml                   pnpm-workspace.yaml
COPY --from=builder /repo/pnpm-lock.yaml                        pnpm-lock.yaml
COPY --from=builder /repo/packages/shared/package.json          packages/shared/package.json
COPY --from=builder /repo/packages/database/package.json        packages/database/package.json
COPY --from=builder /repo/packages/problem-engine/package.json  packages/problem-engine/package.json
COPY --from=builder /repo/packages/ai/package.json              packages/ai/package.json
COPY --from=builder /repo/apps/server/package.json              apps/server/package.json

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate && \
    pnpm install --prod --ignore-scripts --filter=@leetcode/server...

# ─── runtime ─────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

RUN apk add --no-cache tini

# node_modules standalone (symlink .pnpm preserved, cùng layout workspace)
COPY --from=prod-deps /app/ ./

# Artifacts build — copy SAU để sửa dist không invalidate layer node_modules
COPY --from=builder /repo/packages/shared/dist                  packages/shared/dist
COPY --from=builder /repo/packages/database/dist                packages/database/dist
COPY --from=builder /repo/packages/database/drizzle             packages/database/drizzle
COPY --from=builder /repo/packages/problem-engine/dist          packages/problem-engine/dist
COPY --from=builder /repo/packages/ai/dist                      packages/ai/dist
COPY --from=builder /repo/apps/server/dist                      apps/server/dist
COPY --from=builder /repo/apps/web/dist                          apps/web/dist
COPY --from=builder /repo/apps/admin/dist/admin/browser          apps/admin/dist/admin/browser

# Non-root; chỉ chown data dir (chown -R /app sẽ nhân bản node_modules vào layer)
RUN mkdir -p /app/packages/database/data && \
    chown node:node /app/packages/database/data && \
    chmod g+w /app/packages/database/data
USER node

# Data volume (DB + assets) — mount qua docker compose để persist
VOLUME ["/app/packages/database/data"]

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/server/dist/index.js"]