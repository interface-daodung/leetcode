# Execution Walkthrough

> Hướng dẫn chạy toàn bộ hệ thống từ đầu đến cuối cho người mới.

## Bạn sẽ làm được gì

- Chạy web + server + extension cùng lúc.
- Clip đề từ LeetCode về hệ thống chỉ bằng 1 click.
- Thấy đề hiện ngay trên web và ảnh đã được lưu local.

## Chuẩn bị

1. Cài `pnpm` 11.24.0, chạy `pnpm install` ở thư mục gốc.
2. Copy `.env.example` → `.env` (giữ mặc định `http://localhost:3000` nếu chưa đổi host).
3. Trình duyệt Chrome/Edge (để load extension).

## Các bước

### Bước 1 — Chạy server và web

Mở 2 terminal:

- Terminal 1: `pnpm --filter=@leetcode/server dev` → đợi `Server listening at http://0.0.0.0:3000`
- Terminal 2: `pnpm dev` (hoặc `pnpm --filter=@leetcode/web dev`) → đợi `Local: http://localhost:5173`

Kiểm tra nhanh: mở `http://localhost:3000/health` phải trả `ok`, mở `http://localhost:5173` phải thấy giao diện.

### Bước 2 — Cài extension (1 lần)

1. Chạy `pnpm --filter=@leetcode/extension sync:config` (đồng bộ host từ root `.env` vào `apps/extension/api-config.js`).
2. Mở `chrome://extensions` → bật **Developer mode** → **Load unpacked** → chọn thư mục `apps/extension`.
3. Thấy icon extension hiện là xong. Mỗi khi đổi `.env`, chạy lại `sync:config` và bấm **Reload** ở `chrome://extensions`.

### Bước 3 — Clip đề từ LeetCode

1. Mở `https://leetcode.com/problems/two-sum/` (hoặc bất kỳ đề nào).
2. Đợi trang tải xong → góc phải dưới hiện widget tròn **LC**.
3. Bấm widget → thấy toast:
   - **“Đang gửi ... tới http://localhost:3000”** → **“Đã lưu Two Sum”** (201) là thành công.
   - **“Đã tồn tại”** (409) nghĩa là đề đã lưu trước đó.
   - **“Lỗi gửi server”** → kiểm tra server có đang chạy không.
4. Widget cũng đã copy JSON vào clipboard để dự phòng.

### Bước 4 — Kiểm tra trên web

1. Quay lại `http://localhost:5173` → danh sách **Đã lưu** tự có thêm “Two Sum”.
2. Bấm vào đề → xem mô tả (ảnh nếu có đã đổi thành `http://localhost:3000/assets/two-sum/...`).
3. Dán code vào editor → **Run** → xem `passed/total`.

### Bước 5 — Dự phòng: dán thủ công

Nếu server chưa chạy lúc clip, bạn vẫn có JSON trong clipboard:
1. Ở web, dán vào khung **Paste JSON** → **Preview** → **Lưu vào DB** → server sẽ lưu khi bạn bấm.

## Kết quả mong đợi

- Luồng chính: `LeetCode DOM → extension POST http://localhost:3000/api/problems/import → server tải ảnh → lưu DB → web GET /api/problems hiển thị`.
- Luồng dự phòng: `clipboard → web paste → POST /api/problems/import` (cùng kết quả).

## Mẹo & xử lý lỗi

- **Widget không hiện?** Chỉ hiện ở `leetcode.com/problems/*`. Thử reload trang, đợi 2-3 giây cho LeetCode render xong.
- **Bấm widget báo “Chưa tải xong đề bài”?** Đợi trang render xong khối mô tả rồi bấm lại.
- **Đổi host/port?** Sửa root `.env` (`API_URL`, `VITE_API_URL`), rồi chạy `pnpm --filter=@leetcode/extension sync:config` + reload extension + restart server/web.
- **Muốn xóa hết làm lại?** Tắt server, xóa `packages/database/data/leetcode.db` và `assets/`, chạy lại.

## Đọc thêm

- Kiến trúc tổng thể: `AI/ARCHITECTURE.md`
- Chi tiết extension: `AI/index/APP_STRUCTURE.md` và `AI/history/2026-08/leetcode-clipper-extension.md`
- Direct import + assets: `AI/history/2026-08/leetcode-clipper-direct-import-assets.md`
