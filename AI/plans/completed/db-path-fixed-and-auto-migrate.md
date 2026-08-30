# Cố định DB path + Auto-migrate runtime

Trạng thái: **completed** (2026-08-30)

## Vấn đề

- DB path `file:leetcode.db` là relative → tuỳ CWD mà file `.db` rơi rải rác (drizzle-kit ở `packages/database`, server ở `apps/server`).
- Không có migration tự động khi chạy.

## Giải pháp

1. Cố định DB path tại `packages/database/data/leetcode.db` (resolve qua `import.meta.url` trong `client.ts`).
2. Auto-migrate runtime: `client.ts` gọi `migrate()` khi import package.
3. Bỏ `db:push`; thêm `db:migrate` (drizzle-kit, dùng `@libsql/client` WASM).
4. Thêm `*.db*` vào `.gitignore`; tạo `data/.gitkeep`.
5. Đồng bộ tất cả package nội bộ sang ESM (`"type": "module"`) + sửa import `.js`.
6. Bỏ seed script khỏi dự án.

## Kết quả

- DB tại `packages/database/data/leetcode.db` (1 file duy nhất).
- Bảng `problems` + `__drizzle_migrations` tự tạo khi chạy.
- `server build` và `database build` pass.

## File thay đổi

- `packages/database/src/client.ts`
- `packages/database/src/index.ts`
- `packages/database/src/schema.ts`
- `packages/database/package.json`
- `packages/database/drizzle.config.ts`
- `packages/database/tsconfig.json` (mới)
- `packages/database/data/.gitkeep` (mới)
- `.gitignore`
- `packages/{shared,editor,javascript-docs,problem-engine,ai}/package.json` (thêm `"type": "module"`)
- Xóa: `scripts/seed-problems.ts`

## Chi tiết

Xem `history/2026-08/db-path-fixed-and-auto-migrate.md`
