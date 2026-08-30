# Khởi tạo Monorepo + Database SQLite

Ngày: 2026-08-30

## Mục tiêu

- Khởi tạo dự án monorepo mới tên `leetcode` với pnpm workspaces.
- Kiến trúc sạch, có thể mở rộng thêm package sau này mà không phải đập đi làm lại.
- Chuyển database sang SQLite local (theo yêu cầu người dùng).

## Bối cảnh

- Dự án mới, thư mục trống.
- Node v24.13.0, npm 11.6.2, chưa có pnpm.
- Mục tiêu học tập: mỗi feature phải trả lời được "feature này giúp tôi học công nghệ hoặc lưu lại hành trình như thế nào?", không phải project "làm sản phẩm".

## Thay đổi

### Monorepo bootstrap

- Cài đặt pnpm 11.24.0 toàn cục (`npm install -g pnpm`).
- Tạo root `package.json` (private, engines node >=20, scripts `dev`/`build`/`test`/`lint`).
- Tạo `pnpm-workspace.yaml`: workspaces `apps/*` và `packages/*`.
- Tạo `tsconfig.json` root (strict, ES2022, NodeNext, path alias `@leetcode/*`).
- Tạo README với kiến trúc và triết lý học tập.

### Cấu trúc thư mục

```
apps/web, apps/server
packages/shared, database, editor, javascript-docs, problem-engine, ai
problems/easy, medium, hard
docs, scripts, docker
```

### Apps

- `apps/web` — React 18 + Vite: `App.tsx` demo chạy code, entry `index.html` → `main.tsx`.
- `apps/server` — Fastify 4 + Zod: routes `/health`, `/api/problems/:id`, `/api/problems/random/:difficulty`, `/api/problems/:id/run`, `/api/problems/:id/hint`.

### Packages

- `shared` — types dùng chung (`ProblemMeta`, `Difficulty`, `TestCase`), util `formatProblemId`.
- `database` — kết nối SQLite, schema, CRUD `ProblemDatabase`.
- `editor` — editor state + language templates.
- `javascript-docs` — tài liệu JS tham khảo.
- `problem-engine` — registry problem + runner test.
- `ai` — placeholder cho hint/explain.

### Database SQLite (chuyển từ in-memory)

- Ban đầu thử `better-sqlite3` nhưng compile native thất bại (Windows thiếu Visual Studio C++ toolset).
- Chuyển sang **`@libsql/client`** (thuần JS/WASM, không cần compile) + **drizzle-orm 0.45.2**.
- `packages/database/src/schema.ts` — bảng `problems`: id, title, difficulty, tags, description, solution, test_cases, created_at.
- `packages/database/src/client.ts` — kết nối `file:leetcode.db` + drizzle.
- `packages/database/src/index.ts` — `ProblemDatabase` (async CRUD), export `problemDb`.
- `packages/database/drizzle.config.ts` — config drizzle-kit.
- Migration đã generate: `packages/database/drizzle/0000_faithful_captain_britain.sql`.
- `problem-engine` cập nhật gọi `problemDb.add(...)` (async).

### Scripts

- `scripts/seed-problems.ts` — seed 3 bài mẫu: Two Sum, Add Two Numbers, Longest Substring Without Repeating Characters.

## Cài đặt dependencies

- `pnpm approve-builds` cho esbuild (better-sqlite3 đã bị bỏ).
- `pnpm install` thành công, lockfile sạch.

## Kết quả

- Monorepo pnpm workspaces hoạt động (9 workspace projects).
- SQLite local qua `@libsql/client` + Drizzle, không phụ thuộc native build.
- Migration `problems` table đã generate.

## Lệnh tham chiếu

```bash
pnpm install
pnpm --filter=@leetcode/database db:generate
pnpm --filter=@leetcode/database db:push
pnpm --filter=@leetcode/server exec tsx scripts/seed-problems.ts
```

## Ghi chú

- `better-sqlite3` cần Visual Studio C++ toolset; trên máy hiện tại thiếu nên dùng `@libsql/client` thay thế (tránh native build).
- Script `db:push` cần native driver nên migration được apply qua drizzle-kit; nếu gặp lỗi binding, có thể chạy migration SQL trực tiếp.

---

## Chỉ số thay đổi (Commit Index)

Để kiểm tra chi tiết các file đã tạo, tham chiếu các commit sau:

`b6691393233843108866a85ec33d3b152fce7a70`

**feat(database): initialize SQLite database with problems table and ORM setup**

- Added pnpm workspace configuration for better-sqlite3 and esbuild.
- Created drizzle.config.ts for database configuration.
- Implemented SQL migration script to create 'problems' table.
- Added metadata for database schema and journal.
- Developed client.ts for database connection using drizzle-orm.
- Defined schema for 'problems' table with appropriate types and defaults.

---

`6dc991becf1afc6dea5bfef4b630d00f53688e18`

**feat: add pnpm workspace configuration, seed problems script, and TypeScript configuration**

- Created a pnpm workspace configuration file to manage packages in apps and packages directories.
- Added a seed script for registering sample problems in the problem engine, including "Two Sum", "Add Two Numbers", and "Longest Substring Without Repeating Characters".
- Introduced a TypeScript configuration file with strict settings and path mappings for various packages.
