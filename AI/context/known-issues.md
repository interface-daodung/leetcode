# Known Issues

## Current Issues

### 1. Lưu `created_at` sai giá trị — chuỗi `"(datetime('now'))"` thay vì ngày tháng thật

- **File**: `packages/database/src/schema.ts:11`
- **Mô tả**: Cột `created_at` đang lưu chuỗi literal `"(datetime('now'))"` thay vì giá trị datetime thực tế.
- **Ảnh hưởng**: Dữ liệu `created_at` trong DB không có thông tin thời gian thật, gây sai lệch khi truy vấn/sắp xếp theo thời gian tạo.
- **Nguyên nhân**: Đặt `default("(datetime('now'))")` — truyền string thay vì gọi hàm SQL `datetime('now')`. Drizzle cần dùng `sql` (ví dụ ``default(sql`(datetime('now'))`)``) hoặc tương đương để tạo default expression, chứ không phải string literal.
- **Trạng thái**: Chưa sửa (ghi nhận theo yêu cầu, không chỉnh code trong task này).

---

## Resolved Issues

Chưa có issue đã giải quyết.