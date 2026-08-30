# Project Status

Cập nhật: 2026-08-30

## Current Phase

Giai đoạn khởi tạo — scaffold monorepo và các package core.

## Đã hoàn thành

- Khởi tạo pnpm workspace monorepo.
- Tạo `apps/web` (React + Vite, chạy code cục bộ).
- Tạo `apps/server` (Fastify + Zod, API problems/hints).
- Tạo `packages/shared` (types + utils).
- Tạo `packages/database` (Drizzle ORM + SQLite, schema `problems` + migration 0000).
- Tạo `packages/editor` (editor state + language templates).
- Tạo `packages/problem-engine` (in-memory registry + test runner).
- Tạo `packages/ai` (placeholder hints).
- Tạo `packages/javascript-docs` (placeholder static docs).
- Tạo `scripts/seed-problems.ts` (seed 3 sample problems).
- Commit SQLite database init (feat(database): initialize SQLite database).

## Đang làm

- Chưa xác định công việc cụ thể đang triển khai dở.

## Tiếp theo

Theo README `Next Steps`:

- [ ] Thêm Prisma + SQLite cho problem persistence (ghi chú: hiện dùng Drizzle, cần thống nhất ORM).
- [ ] Tích hợp Monaco Editor trong web app.
- [ ] Thêm WebSocket cho real-time code execution.
- [ ] Implement AI hint streaming với Vercel AI SDK.
- [ ] Build problem import từ LeetCode API.
- [ ] Thêm progress tracking và spaced repetition.

> Đây là roadmap trong README, chưa phải plan đã được chốt trong `plans/`.

## Known Issues

Xem:

`context/known-issues.md`

## Ghi chú

File này phải được cập nhật khi project có thay đổi lớn.
