---
name: database-change
description: Hướng dẫn thay đổi database an toàn với Drizzle/SQLite. Use when thay đổi schema, migration, model, hoặc cấu trúc dữ liệu.
---

# Database Change

## Workflow

1. Xác định database hiện tại.
2. Đọc schema/model.
3. Đọc migration hiện tại.
4. Xác định ảnh hưởng.
5. Tạo migration theo framework hiện tại.
6. Không sửa database production trực tiếp nếu workflow project không cho phép.
7. Test migration.
8. Test rollback nếu hệ thống hỗ trợ.
9. Cập nhật documentation nếu cần (dùng GitNexus hoặc ghi history).
10. Ghi technical decision nếu cần.
11. Ghi history.

## Ghi chú project cụ thể

- Database: SQLite (`@libsql/client`).
- ORM: Drizzle (`packages/database/src/schema.ts`).
- Migration: `drizzle-kit generate` / auto-migrate runtime (config: `packages/database/drizzle.config.ts`).
- Migration hiện có: `packages/database/drizzle/0000_init.sql` (khởi tạo + seed 3 problems).

## Không được

- xóa data tùy tiện
- reset database production
- bỏ qua migration
- sửa schema nhưng không cập nhật documentation
