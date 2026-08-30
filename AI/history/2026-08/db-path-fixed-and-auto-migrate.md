# Cố định DB path + Auto-migrate runtime

Ngày: 2026-08-30

## Mục tiêu

- Cố định vị trí file SQLite tại `packages/database/data/leetcode.db` (trước đây path relative `file:leetcode.db` phụ thuộc CWD nên file rơi rải rác).
- Thêm logic migration tự động khi chạy (runtime auto-migrate).
- Bỏ `db:push` và bỏ seed script khỏi dự án.
- Đồng bộ các package nội bộ thành ESM.

## Bối cảnh

- DB path cũ `file:leetcode.db` là relative → tuỳ nơi chạy (drizzle-kit từ `packages/database`, seed/server từ `apps/server`) mà file `.db` được tạo ở chỗ khác nhau.
- `better-sqlite3` không compile được trên máy (thiếu Visual Studio C++ toolset), nên dùng `@libsql/client` (WASM/JS, có prebuilt `@libsql/win32-x64-msvc`).
- Người dùng muốn DB lưu tại `packages/database/data/leetcode.db`, thêm `*.db` vào `.gitignore`, và không dùng seed (dữ liệu sẽ vào qua server khác).
- `node:sqlite` tích hợp sẵn từ Node 22.5.0 nhưng vẫn dùng `@libsql/client` theo yêu cầu.

## Thay đổi

### DB path cố định

- `packages/database/src/client.ts`:
  - Resolve path qua `import.meta.url` → `packages/database/data/leetcode.db` (không phụ thuộc CWD).
  - Tạo client `@libsql/client` + drizzle instance.
- `packages/database/drizzle.config.ts`: đổi `url` thành `./data/leetcode.db`.
- Tạo `packages/database/data/.gitkeep` (để git track folder trống, file `.db` bị ignore).
- `.gitignore`: thêm `*.db`, `*.db-journal`, `*.db-wal`, `*.db-shm`.

### Auto-migrate runtime

- `packages/database/src/client.ts`: gọi `migrate(db, { migrationsFolder })` ngay khi import package → mỗi lần server/API chạy, schema tự động được tạo/cập nhật từ các file trong `drizzle/`.
- `packages/database/package.json`: bỏ `db:push`, thêm `db:migrate` (`drizzle-kit migrate` — dùng `@libsql/client` WASM, không cần native build). Giữ `db:generate`, `db:studio`. Thêm devDependency `@types/node`.
- Xác minh: drizzle-kit 0.31 ưu tiên `@libsql/client` hơn `better-sqlite3` khi resolve → CLI migrate hoạt động trên máy không cần C++.

### Đồng bộ ESM

- Chuyển `@leetcode/database`, `@leetcode/shared`, `@leetcode/editor`, `@leetcode/javascript-docs`, `@leetcode/problem-engine`, `@leetcode/ai` sang `"type": "module"` (vì `database` có top-level await; CJS `require()` ESM async gây `ERR_REQUIRE_ASYNC_MODULE`).
- Sửa import relative dùng extension `.js` (`./schema.js`, `./client.js`) cho NodeNext.
- Thêm `packages/database/tsconfig.json` riêng (trước đây dùng root tsconfig, kéo cả web gây lỗi JSX).

### Bỏ seed

- Xóa `scripts/seed-problems.ts` và `apps/server/src/seed-runner.ts` (chạy seed 1 lần để tạo DB + 3 sample problems rồi bỏ).
- DB hiện có 3 problems (Two Sum, Add Two Numbers, Longest Substring Without Repeating Characters) đã được insert trước khi xóa seed.

## Kết quả

- DB file nằm cố định tại `packages/database/data/leetcode.db` (đã xác minh: chỉ có 1 file duy nhất).
- Bảng `problems` + `__drizzle_migrations` được tạo tự động (đã xác minh).
- `pnpm --filter=@leetcode/server build` và `pnpm --filter=@leetcode/database build` đều pass.

## Lệnh tham chiếu

```bash
# Generate migration khi đổi schema
pnpm --filter=@leetcode/database db:generate

# CLI migrate (optional, auto-migrate đã chạy lúc runtime)
pnpm --filter=@leetcode/database db:migrate

# Studio xem dữ liệu
pnpm --filter=@leetcode/database db:studio
```

## Ghi chú

- Auto-migrate chạy mỗi khi import `@leetcode/database`; nếu migration file thay đổi, server tự cập nhật khi khởi động.
- Seed đã bị bỏ khỏi dự án — dữ liệu problems sẽ được đưa vào qua server/API sau này.
- Migration lịch sử: `0000_faithful_captain_britain.sql` (apply qua auto-migrate).

## Chỉ số thay đổi (Commit Index)

Thay đổi này chưa được commit. Các commit trước liên quan database:

`b6691393233843108866a85ec33d3b152fce7a70` — feat(database): initialize SQLite database with problems table and ORM setup

`6dc991becf1afc6dea5bfef4b630d00f53688e18` — feat: add pnpm workspace configuration, seed problems script, and TypeScript configuration
