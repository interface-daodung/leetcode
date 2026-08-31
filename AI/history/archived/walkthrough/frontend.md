# Frontend Walkthrough

> Hướng dẫn sử dụng web cho người mới — không cần đọc code.

## Bạn sẽ làm được gì

- Mở web LeetCode Lab, xem danh sách đề bài đã lưu (Explorer panel + tìm kiếm + lọc độ khó).
- Bấm vào đề để xem mô tả, gợi ý, template code và chạy thử code ngay trên trình duyệt.
- **Kéo thả tab** giữa các panel (Explorer/Editor/Description/Output) để tùy chỉnh layout, panel tự động nhớ vị trí.
- **Resize panel** bằng splitter giữa các tabset, **maximize** tabset (double-click header).
- Chuyển đổi theme sáng/tối — đồng bộ cả FlexLayout.
- Layout được **persist vào localStorage**: reload trang, layout vẫn giữ nguyên.

## Chuẩn bị

- Đã cài `pnpm` và chạy `pnpm install` ở thư mục gốc.
- Server đang chạy (`pnpm --filter=@leetcode/server dev` → `http://localhost:3000`).
- File `.env` ở thư mục gốc đã có `VITE_API_URL=http://localhost:3000` (mặc định đã có sẵn, xem `AI/index/DATA_STRUCTURE.md`).

## Các bước

### Bước 1 — Mở web

1. Chạy `pnpm dev` ở thư mục gốc.
2. Mở `http://localhost:5173` trên trình duyệt.
3. Bạn sẽ thấy: **Header** (logo + nút đổi theme) và **dockable layout** với 4 tab: **Explorer** (danh sách đề, ô tìm kiếm, bộ lọc All/Easy/Medium/Hard), **Editor**, **Description**, **Output**.
4. Mở trang đầu tự chuyển tới đề bài đầu tiên trong danh sách.

### Bước 2 — Xem đề bài

1. Ở **Explorer**, bấm vào một đề → **Description** hiện ra: tiêu đề, badge độ khó, tags, link LeetCode, mô tả (ảnh đã tải về local qua `/assets/...`).
2. Phần **Gợi ý** (nếu có) bấm để mở ra, hiển thị từng hint.
3. Phần **Editor** có sẵn template (nếu đề có), đã tô màu cú pháp theo theme.

### Bước 3 — Chạy code

1. Viết/dán code giải vào **Editor** → bấm **▶ Run**.
2. Kết quả hiện ở **Output** (hoặc cạnh nút Run): `Kết quả: passed / total test case đúng` (gọi `POST /api/problems/:id/run`), kèm tabs Input/Expected/Actual cho từng test case.

### Bước 4 — Tùy chỉnh layout

1. **Kéo tab** (vd kéo "Description") thả sang vị trí khác (cạnh tabset, chia đôi...) → layout tree thay đổi.
2. **Resize** bằng cách kéo splitter giữa các panel.
3. **Maximize** một tabset bằng cách double-click vào header tabset.
4. Reload trang → layout được **khôi phục từ localStorage** (`lc:layout:json`).

### Bước 5 — Đổi theme

1. Bấm nút **🌙/☀️** ở góc phải header để chuyển sáng/tối — cả trang, code editor và FlexLayout đổi màu theo CSS variables (`data-theme` + `flexlayout__theme_*`), nhớ lựa chọn qua `localStorage`.

## Cách đề bài được thêm

Không cần nhập tay. Mở `leetcode.com/problems/<slug>` → bấm widget **LC** của extension → đề được POST thẳng tới server → quay lại web, sidebar có đề mới (reload trang).

## Mẹo & xử lý lỗi

- **Web không hiện list?** Kiểm tra server đã chạy và `VITE_API_URL` đúng. Thử mở `http://localhost:3000/api/problems` trên trình duyệt — phải trả JSON.
- **Bấm đề báo "Không tìm thấy"?** Đề chưa có trong DB (chưa clip qua extension) hoặc ID không tồn tại.
- **Ảnh không hiện?** Kiểm tra `packages/database/data/assets/<slug>/` có file không; nếu fetch ảnh gốc fail, mô tả sẽ giữ nguyên link cũ.

## Đọc thêm

- Cấu trúc app: `AI/index/APP_STRUCTURE.md`
- Luồng dữ liệu clip → import: `AI/index/DATA_STRUCTURE.md`
- Hành trình extension: `AI/history/2026-08/leetcode-clipper-extension.md` và `leetcode-clipper-direct-import-assets.md`
