# Database Walkthrough

> Hướng dẫn sử dụng dữ liệu cho người mới — biết dữ liệu lưu ở đâu và cách kiểm tra.

## Bạn sẽ làm được gì

- Biết file DB nằm ở đâu và cách nó tự tạo.
- Xem danh sách đề đã lưu.
- Hiểu ảnh trong đề được lưu thế nào và tránh trùng ra sao.

## Chuẩn bị

- Server đã chạy ít nhất 1 lần (để auto-migrate tạo DB).
- Không cần cài thêm gì — SQLite đã đi kèm qua `@libsql/client`.

## Các bước

### Bước 1 — Tìm file DB

- File DB duy nhất: `packages/database/data/leetcode.db`
- Đường dẫn này cố định, không phụ thuộc bạn chạy lệnh ở đâu (đã fix trong `AI/history/2026-08/db-path-fixed-and-auto-migrate.md`).
- File bị `.gitignore` nên không có trong git — chỉ nằm trên máy bạn.

### Bước 2 — Xem dữ liệu (3 cách)

**Cách 1 — qua API (dễ nhất):**
- Mở `http://localhost:3000/api/problems` → thấy JSON danh sách.

**Cách 2 — qua web:**
- Mở `http://localhost:5173` → danh sách “Đã lưu” chính là dữ liệu từ DB.

**Cách 3 — qua Drizzle Studio (khi cần soi bảng):**
1. Chạy `pnpm --filter=@leetcode/database db:studio`
2. Mở link studio hiện ra → chọn bảng `problems` để xem `id`, `title`, `difficulty`, `description`...

### Bước 3 — Hiểu ảnh được lưu thế nào

- Khi import đề có `<img>`, server tải ảnh về `packages/database/data/assets/<slug>/<ten-file>` (ví dụ `two-sum/image.png`).
- Nếu cùng một ảnh xuất hiện ở nhiều đề, server chỉ lưu 1 lần (tính SHA-256 của ảnh, lưu trong `assets/.hash-index.json` để dedupe).
- Trong `description`, link ảnh gốc được đổi thành `http://localhost:3000/assets/<slug>/<ten-file>` nên web hiển thị được ngay cả khi offline.

### Bước 4 — Migration (bạn thường không cần làm)

- Lần đầu chạy server, DB tự tạo bảng `problems` (auto-migrate từ `packages/database/drizzle/0000_init.sql`).
- Nếu sau này schema đổi (ví dụ thêm cột `created_at`), chạy `pnpm --filter=@leetcode/database db:generate` để sinh migration mới, rồi khởi động lại server là tự cập nhật.
- Lệnh thủ công (hiếm khi cần): `pnpm --filter=@leetcode/database db:migrate`

## Kết quả mong đợi

- Sau khi import 1 đề có ảnh, bạn sẽ thấy file ảnh trong `packages/database/data/assets/<slug>/` và `GET http://localhost:3000/assets/<slug>/<ten-file>` mở được ảnh.

## Mẹo & xử lý lỗi

- **Không thấy DB?** Chạy lại server — auto-migrate sẽ tạo. Kiểm tra `packages/database/data/` có `.gitkeep` không.
- **Ảnh không tải?** Có thể link gốc 404 hoặc timeout 15s — server sẽ giữ nguyên link cũ, không làm hỏng import.
- **Muốn xóa DB để làm lại?** Tắt server, xóa `packages/database/data/leetcode.db` và `assets/`, chạy lại server.

## Đọc thêm

- Cấu trúc bảng: `AI/index/DATA_STRUCTURE.md`
- Lịch sử fix DB path + auto-migrate: `AI/history/2026-08/db-path-fixed-and-auto-migrate.md`
- Tài sản ảnh: `AI/history/2026-08/leetcode-clipper-direct-import-assets.md`
