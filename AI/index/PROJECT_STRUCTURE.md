# Project Structure

## Repository Tree

```text
leetcode/
├── AGENT.md                       # Agent instructions (bootstrap)
├── opencodeconfig.jsonc           # OpenCode repo config (bootstrap)
├── AI/                            # Project knowledge base (bootstrap)
├── apps/
│   ├── server/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/index.ts           # Fastify server (entry point)
│   └── web/
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── vite.config.ts
│       └── src/
│           ├── main.tsx           # React entry
│           └── App.tsx            # App component
├── packages/
│   ├── shared/                    # Types, utilities, constants
│   │   ├── package.json
│   │   └── src/index.ts
│   ├── database/                  # Drizzle ORM + SQLite
│   │   ├── package.json
│   │   ├── drizzle.config.ts
│   │   ├── drizzle/               # Generated migrations
│   │   │   ├── 0000_init.sql
│   │   │   └── meta/
│   │   └── src/
│   │       ├── client.ts          # SQLite client + drizzle db
│   │       ├── index.ts           # ProblemDatabase
│   │       └── schema.ts          # problems table
│   ├── editor/                    # Editor state + language templates
│   │   ├── package.json
│   │   └── src/index.ts
│   ├── javascript-docs/           # JS/TS reference (static)
│   │   ├── package.json
│   │   └── src/index.ts
│   ├── problem-engine/            # In-memory registry + test runner
│   │   ├── package.json
│   │   └── src/index.ts
│   └── ai/                        # LLM integration (placeholder)
│       ├── package.json
│       └── src/index.ts
├── problems/                      # Problem files (empty subfolders)
│   ├── easy/
│   ├── medium/
│   └── hard/
├── docs/                          # Learning notes / ADR (empty)
├── scripts/                          # Automation (seed đã bị bỏ)
├── docker/                        # Container configs (empty)
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
└── tsconfig.json
```

## Root Directories

| Path | Purpose |
| ---- | ------- |
| `apps/` | Các ứng dụng (`web`, `server`) |
| `packages/` | Các package dùng chung (`shared`, `database`, `editor`, `javascript-docs`, `problem-engine`, `ai`) |
| `problems/` | Dự kiến chứa problem files theo difficulty (hiện rỗng) |
| `docs/` | Dự kiến chứa learning notes, ADR (hiện rỗng) |
| `scripts/` | Automation (seed đã bị bỏ) |
| `docker/` | Dự kiến chứa container configs (hiện rỗng) |
| `AI/` | Project knowledge base dành cho Agent |

## Important Files

| File | Purpose |
| ---- | ------- |
| `package.json` | Root package, scripts dev/build/test/lint, packageManager pnpm@11.24.0 |
| `pnpm-workspace.yaml` | Khai báo workspace `apps/*`, `packages/*` |
| `tsconfig.json` | Root TS config + path aliases `@leetcode/*` |
| `README.md` | Tổng quan project, architecture, quick start, learning goals |
| `apps/server/src/index.ts` | Fastify server, tất cả API endpoints |
| `apps/web/src/App.tsx` | React app chính |
| `packages/shared/src/index.ts` | Types `Difficulty`, `ProblemMeta`, `TestCase`; util `formatProblemId` |
| `packages/problem-engine/src/index.ts` | `ProblemEngine` class + singleton `engine` |
| `packages/database/src/schema.ts` | Drizzle schema bảng `problems` |
| `packages/database/src/client.ts` | SQLite client + drizzle instance + auto-migrate |
| `packages/database/data/` | Thư mục chứa DB file (`leetcode.db`, bị git ignore) |
| `packages/database/drizzle/0000_init.sql` | Migration đầu tiên (khởi tạo + seed) |

## Entry Points

- Server: `apps/server/src/index.ts` (chạy `pnpm --filter=@leetcode/server dev` → tsx watch).
- Web: `apps/web/index.html` → `src/main.tsx`.

## Generated / Ignored Areas

- `node_modules/` — đã ignore.
- `dist/` — output build (chưa tạo).
- `packages/database/drizzle/meta/` — snapshot do drizzle-kit sinh.
- `leetcode.db` — database file runtime (chưa xuất hiện trong repo).
