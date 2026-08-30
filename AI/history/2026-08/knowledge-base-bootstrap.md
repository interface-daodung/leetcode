# AI Knowledge Base Bootstrap

Ngày: 2026-08-30

## Mục tiêu

Khởi tạo hệ thống Project Memory + Agent Instructions.

## Thay đổi

- Tạo `AGENT.md`.
- Tạo `opencodeconfig.jsonc`.
- Tạo `AI/`.
- Tạo source index.
- Tạo walkthrough.
- Tạo skills.
- Tạo context.
- Tạo plans.
- Tạo history.

## Repository Analysis

### Language

TypeScript (strict), JSX cho React app.

### Framework

- Frontend: React 18 + Vite.
- Backend: Fastify 4.
- ORM: Drizzle ORM (SQLite).
- Validation: Zod 3.

### Package Manager

pnpm 11.24.0 (workspace monorepo, `pnpm-workspace.yaml`).

### Applications

- `apps/web` — React SPA.
- `apps/server` — Fastify API server.

### Database

SQLite (`@libsql/client`) + Drizzle ORM, bảng `problems`.

### Test Framework

Vitest 2 (đã khai báo, chưa có test file).

## Kết quả

Knowledge base đã được khởi tạo.

## Ghi chú

Documentation sẽ tiếp tục được bổ sung trong các lần làm việc sau.
