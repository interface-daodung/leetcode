# Known Issues

## Current Issues

Chưa có issue đang mở.

---

## Resolved Issues

### 1. Lưu `created_at` sai giá trị — chuỗi `"(datetime('now'))"` thay vì ngày tháng thật

- **File**: `packages/database/src/schema.ts:14`
- **Mô tả**: Cột `created_at` trước đây lưu chuỗi literal `"(datetime('now'))"` thay vì giá trị datetime thực tế.
- **Ảnh hưởng**: Dữ liệu `created_at` trong DB không có thông tin thời gian thật, gây sai lệch khi truy vấn/sắp xếp theo thời gian tạo.
- **Nguyên nhân**: Trước đây dùng `default("(datetime('now'))")` — truyền string thay vì gọi hàm SQL `datetime('now')`. Drizzle cần dùng `sql` để tạo default expression.
- **Cách fix**: Đổi sang `default(sql\`(datetime('now'))\`)` tại `packages/database/src/schema.ts:14` (đã áp dụng trong commit `fa9c962`, đi kèm migration `0001`).
- **Ngày resolve**: 2026-08-30
- **Plan**: `AI/plans/completed/fix-created-at-default.md`
