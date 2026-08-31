# Extension Walkthrough

> Hướng dẫn cài và dùng LeetCode Widget cho người mới.

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
3. Thấy **LeetCode Widget** hiện trong list là xong. Bấm **Reload** nếu vừa sync lại.

### Bước 3 — Dùng trên LeetCode

1. Mở `https://leetcode.com/problems/two-sum/`.
2. Đợi trang render → góc phải dưới hiện widget ảnh **Idle.png** (có thể kéo thả).
3. Bấm widget → hiệu ứng **Squash & Stretch** 1.2s, widget đổi sang Loading → Success/Error tùy kết quả, toast SVG hiển thị:
   - “Đã lưu” → thành công (tạo mới).
   - “Đã ghi đè” → đề đã tồn tại, server cập nhật bản mới.
   - “Lỗi gửi server” → kiểm tra server có chạy không.

> Widget đồng thời copy JSON vào clipboard — nếu server chưa chạy, bạn vẫn dán thủ công ở web.

### Bước 4 — Kiểm tra

- Mở `http://localhost:5173` → đề mới đã trong danh sách.
- Mở `http://localhost:3000/api/problems` → thấy JSON đề vừa clip.

## Mẹo & xử lý lỗi

- **Không thấy widget?** Chỉ hiện ở `*/problems/*`. Reload trang, đợi 2-3 giây.
- **Bấm báo “Chưa tải xong”?** Đợi khối mô tả hiện rồi bấm lại.
- **Template sai (hiện tên hàm bài khác, VD `shipWithinDays` thay `shortestPathBinaryMatrix`)?** Do LeetCode SPA cache `window.monaco`. Đã fix từ 2026-08-31: extension ưu tiên `code_editor` DOM trước `window.monaco`. Nếu vẫn sai, reload trang (F5) rồi bấm lại LC sau khi editor hiện.
- **Thiếu testCases (JSON không có `testCases` hoặc chỉ 1 case)?** Extension thử 4 nguồn: `hidden cm-content` → `visible console` → `__NEXT_DATA__ exampleTestcases` → `description <pre>`. Với bài như `1091` (chỉ có Example), testCases được parse từ `<pre> Input: grid = [[...]] / Output: 2`. Nếu vẫn thiếu, kiểm tra xem description có `<pre>` Example không, và mở Console (DevTools) xem `buildProblemClip` có lỗi.
- **Đổi port?** Sửa `.env` → `sync:config` → Reload extension → restart server/web.

## Đọc thêm

- Lịch sử extension: `AI/history/2026-08/leetcode-clipper-extension.md`
- Direct import + assets: `AI/history/2026-08/leetcode-clipper-direct-import-assets.md`
- Widget ảnh động + ghi đè: `AI/history/2026-08/widget-animated-images-and-overwrite.md`
- Luồng tổng thể: `AI/walkthrough/execution.md`
