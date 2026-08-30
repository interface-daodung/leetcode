# Project

## Tên project

LeetCode Lab — Learning Journey Monorepo (`leetcode-monorepo`)

## Mục tiêu

Monorepo để học algorithms, data structures và full-stack development thông qua giải LeetCode problems.

Mỗi feature trong repo phải trả lời được câu hỏi:

> "Feature này giúp tôi học công nghệ hoặc lưu lại hành trình lập trình của mình như thế nào?"

Đây là một **learning lab**, không phải product thương mại.

## Phạm vi

- Web app để luyện code trong trình duyệt.
- API server cung cấp problem engine và AI hints.
- Storage problem: in-memory → SQLite → (kế hoạch) PostgreSQL.
- Packages phục vụ học tập: shared types, database, editor, docs, problem-engine, AI.
- Scripts: seeding problems.
- Docs: ghi chú học tập và architecture decisions.

## Người dùng / đối tượng sử dụng

Chủ yếu là chính tác giả repository — dùng để học và lưu lại hành trình lập trình.

> Không có định nghĩa user/product nào khác được xác định từ repository.

## Các thành phần chính

- `apps/web` — React 18 + Vite frontend (editor, run code).
- `apps/server` — Fastify API (problems, test runner, AI hints).
- `packages/shared` — TypeScript types, utilities (ví dụ: `formatProblemId`, `Difficulty`, `ProblemMeta`).
- `packages/database` — Drizzle ORM + SQLite (libsql client), bảng `problems`.
- `packages/editor` — Editor state, language templates.
- `packages/problem-engine` — In-memory problem registry + test runner.
- `packages/ai` — AI hint/explanation (hiện là placeholder, chưa gắn LLM thật).
- `packages/javascript-docs` — Static JS/TS reference (placeholder).
- `scripts/seed-problems.ts` — Seed sample problems.
- `docker/` — Thư mục dự kiến chứa container configs (hiện rỗng).
- `docs/` — Thư mục dự kiến chứa learning notes và ADR (hiện rỗng).
- `problems/` — Thư mục dự kiến chứa problem files theo difficulty (hiện chỉ có subfolder rỗng).

## Công nghệ

- **Language**: TypeScript (strict), JSX cho React.
- **Runtime**: Node.js >= 20.
- **Package manager**: pnpm 11.24.0 (workspace monorepo, `pnpm-workspace.yaml`).
- **Framework**: React 18.3, Vite 5, Fastify 4.
- **ORM**: Drizzle ORM 0.45 + drizzle-kit 0.31; client `@libsql/client` (SQLite).
- **Database**: SQLite (file `leetcode.db`, hiện chưa được tạo/commit).
- **Validation**: Zod 3.
- **Testing**: Vitest 2 (đã khai báo trong scripts, chưa có test file).
- **Lint**: ESLint 9.
- **Node runner**: tsx.

## Repository

`https://github.com/...` (chưa xác định được URL cụ thể từ repository)

## Trạng thái

Xem:

`STATUS.md`

## Ghi chú

File này được bổ sung dần trong quá trình phát triển.

Không tự suy diễn thông tin chưa được xác nhận.
