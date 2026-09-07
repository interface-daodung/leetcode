# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────
# LeetCode monorepo — single image build + runtime
# Stage 1: deps   — pnpm install với lockfile (cache toàn workspace)
# Stage 2: builder — build packages + apps/web (vite) + apps/server (tsc)
# Stage 3: runtime — chỉ copy artifacts, không source/devDeps
# ─────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=20-alpine
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

# Cài full workspace (giữ devDeps vì cần typescript build)
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ─── builder ─────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /repo

# Copy source code
COPY tsconfig.json ./
COPY packages/ packages/
COPY apps/ apps/

# 1) Build các package (override --noEmit để emit dist/)
#    Patch main/types sau đó để Node runtime load .js (không cần tsx)
RUN node scripts/docker-build.mjs

# 2) Build web SPA (vite output ra apps/web/dist)
RUN pnpm --filter=@leetcode/web build

# 3) Build server (tsc emit apps/server/dist)
RUN pnpm --filter=@leetcode/server build

# ─── runtime ─────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runtime
ARG PNPM_VERSION
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate && \
    apk add --no-cache tini wget

# Manifests đã patch (main → dist/index.js) — workspace structure
COPY --from=builder /repo/package.json                          package.json
COPY --from=builder /repo/pnpm-workspace.yaml                   pnpm-workspace.yaml
COPY --from=builder /repo/pnpm-lock.yaml                        pnpm-lock.yaml
COPY --from=builder /repo/packages/shared/package.json          packages/shared/package.json
COPY --from=builder /repo/packages/shared/dist                  packages/shared/dist
COPY --from=builder /repo/packages/database/package.json        packages/database/package.json
COPY --from=builder /repo/packages/database/dist                packages/database/dist
COPY --from=builder /repo/packages/database/drizzle             packages/database/drizzle
COPY --from=builder /repo/packages/problem-engine/package.json  packages/problem-engine/package.json
COPY --from=builder /repo/packages/problem-engine/dist          packages/problem-engine/dist
COPY --from=builder /repo/packages/ai/package.json              packages/ai/package.json
COPY --from=builder /repo/packages/ai/dist                      packages/ai/dist
COPY --from=builder /repo/apps/server/package.json              apps/server/package.json
COPY --from=builder /repo/apps/server/dist                      apps/server/dist
COPY --from=builder /repo/apps/web/dist                          apps/web/dist

# Cài node_modules production-only cho server + packages
RUN pnpm install --prod --ignore-scripts --filter=@leetcode/server \
    --filter=@leetcode/shared --filter=@leetcode/database \
    --filter=@leetcode/problem-engine --filter=@leetcode/ai \
    --filter=@leetcode/javascript-docs

# Data volume (DB + assets) — mount qua docker compose để persist
VOLUME ["/app/packages/database/data"]

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/server/dist/index.js"]