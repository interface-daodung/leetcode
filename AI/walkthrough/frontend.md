# Frontend Walkthrough

> Hướng dẫn sử dụng web cho người mới — không cần đọc code.

## Bạn sẽ làm được gì

- Mở web LeetCode Lab, xem danh sách đề bài đã lưu.
- Dán JSON từ extension để thêm đề mới (có preview trước khi lưu).
- Chạy thử code ngay trên trình duyệt và xem kết quả.

## Chuẩn bị

- Đã cài `pnpm` và chạy `pnpm install` ở thư mục gốc.
- Server đang chạy (`pnpm --filter=@leetcode/server dev` → `http://localhost:3000`).
- File `.env` ở thư mục gốc đã có `VITE_API_URL=http://localhost:3000` (mặc định đã có sẵn, xem `AI/index/DATA_STRUCTURE.md`).

## Các bước

### Bước 1 — Mở web

1. Chạy `pnpm dev` ở thư mục gốc.
2. Mở `http://localhost:5173` trên trình duyệt.
3. Bạn sẽ thấy: vùng editor (chạy code), vùng **Paste JSON** và danh sách **Đã lưu**.

### Bước 2 — Thêm đề bài (2 cách)

**Cách A — tự động qua extension (khuyên dùng):**
- Cài extension theo `AI/walkthrough/execution.md` → mở `leetcode.com/problems/<slug>` → bấm widget **LC** → web tự hiện đề mới sau 1-2 giây (extension đã POST thẳng tới server).

**Cách B — dán thủ công:**
1. Ở web, tìm khung **“Dán JSON từ extension”**.
2. Bấm **Paste từ clipboard** (hoặc `Ctrl+V` vào textarea).
3. Xem **preview**: tiêu đề, độ khó (Easy/Medium/Hard), mô tả đã làm sạch.
4. Bấm **Lưu vào DB** → báo “Đã lưu” là thành công, list bên dưới tự cập nhật.

> Mẹo: nếu JSON thiếu `title`/`description`, web sẽ báo lỗi ngay — hãy clip lại từ LeetCode.

### Bước 3 — Xem và chạy code

1. Trong danh sách **Đã lưu**, bấm vào đề bài để xem mô tả (ảnh trong đề đã được tải về local, hiển thị qua `/assets/...`).
2. Ở editor, chọn ngôn ngữ (hiện hỗ trợ `javascript`), dán code giải.
3. Bấm **Run** → kết quả `passed/total` hiện ngay bên dưới (chạy cục bộ bằng `new Function`, không gửi server).

## Kết quả mong đợi

- Sau khi lưu, `GET /api/problems` trả về đề mới và web hiển thị ngay.
- Ảnh trong mô tả không còn trỏ ra ngoài internet mà là `http://localhost:3000/assets/<slug>/...` (đã dedupe).

## Mẹo & xử lý lỗi

- **Web không hiện list?** Kiểm tra server đã chạy và `VITE_API_URL` đúng. Thử mở `http://localhost:3000/api/problems` trên trình duyệt — phải trả JSON.
- **Paste báo “JSON không hợp lệ”?** Hãy clip lại, đảm bảo copy đủ JSON từ extension (không cắt dòng).
- **Lưu báo 409 “Đã tồn tại”?** Đề đã có trong DB — không cần lưu lại.
- **Ảnh không hiện?** Kiểm tra `packages/database/data/assets/<slug>/` có file không; nếu fetch ảnh gốc fail, mô tả sẽ giữ nguyên link cũ.

## Đọc thêm

- Cấu trúc app: `AI/index/APP_STRUCTURE.md`
- Luồng dữ liệu clip → import: `AI/index/DATA_STRUCTURE.md`
- Hành trình extension: `AI/history/2026-08/leetcode-clipper-extension.md` và `leetcode-clipper-direct-import-assets.md`
