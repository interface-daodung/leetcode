# Extension Walkthrough

> Hướng dẫn cài và dùng LeetCode Clipper cho người mới.

## Bạn sẽ làm được gì

- Cài extension lên Chrome/Edge chỉ bằng Load unpacked.
- Clip đề từ LeetCode về hệ thống chỉ 1 click, không cần copy/paste thủ công.

## Chuẩn bị

- Đã có file `.env` ở thư mục gốc (chứa `EXTENSION_API_URL` hoặc `API_URL`).
- Trình duyệt Chrome hoặc Edge.

## Các bước

### Bước 1 — Đồng bộ host

1. Mở root `.env`, kiểm tra `EXTENSION_API_URL=http://localhost:3000` (hoặc `API_URL`).
2. Chạy `pnpm --filter=@leetcode/extension sync:config`
   - Lệnh này tạo `apps/extension/api-config.js` với `var LC_API_BASE = "http://localhost:3000"` và cập nhật `host_permissions` trong `manifest.json`.
3. Mỗi khi đổi `.env`, chạy lại lệnh trên.

### Bước 2 — Load extension

1. Mở `chrome://extensions` → bật **Developer mode**.
2. Bấm **Load unpacked** → chọn thư mục `apps/extension`.
3. Thấy **LeetCode Clipper** hiện trong list là xong. Bấm **Reload** nếu vừa sync lại.

### Bước 3 — Dùng trên LeetCode

1. Mở `https://leetcode.com/problems/two-sum/`.
2. Đợi trang render → góc phải dưới hiện nút tròn **LC** (có thể kéo thả).
3. Bấm nút → widget hiện toast:
   - “Đã lưu” → thành công, web sẽ hiện đề mới.
   - “Đã tồn tại” → đề đã lưu trước đó.
   - “Lỗi gửi server” → kiểm tra server có chạy không.

> Widget đồng thời copy JSON vào clipboard — nếu server chưa chạy, bạn vẫn dán thủ công ở web.

### Bước 4 — Kiểm tra

- Mở `http://localhost:5173` → đề mới đã trong danh sách.
- Mở `http://localhost:3000/api/problems` → thấy JSON đề vừa clip.

## Mẹo & xử lý lỗi

- **Không thấy widget?** Chỉ hiện ở `*/problems/*`. Reload trang, đợi 2-3 giây.
- **Bấm báo “Chưa tải xong”?** Đợi khối mô tả hiện rồi bấm lại.
- **Đổi port?** Sửa `.env` → `sync:config` → Reload extension → restart server/web.

## Đọc thêm

- Lịch sử extension: `AI/history/2026-08/leetcode-clipper-extension.md`
- Direct import + assets: `AI/history/2026-08/leetcode-clipper-direct-import-assets.md`
- Luồng tổng thể: `AI/walkthrough/execution.md`
