# Backend Walkthrough

> Hướng dẫn sử dụng server cho người mới — chỉ cần biết cách chạy và thử API.

## Bạn sẽ làm được gì

- Khởi động API server và kiểm tra nó đang chạy.
- Hiểu các API chính để web và extension dùng (không cần nhớ code).
- Đổi host/port một chỗ trong `.env` cho cả hệ thống.

## Chuẩn bị

- File `.env` ở thư mục gốc (copy từ `.env.example` nếu chưa có):
  ```
  PORT=3000
  HOST=0.0.0.0
  API_URL=http://localhost:3000
  VITE_API_URL=http://localhost:3000
  EXTENSION_API_URL=http://localhost:3000
  ```
- Đã `pnpm install`.

## Các bước

### Bước 1 — Chạy server

1. Chạy `pnpm --filter=@leetcode/server dev`
2. Thấy log `Server listening at http://0.0.0.0:3000` và `Assets served from ... at http://localhost:3000/assets/` là thành công.
3. Mở `http://localhost:3000/health` → trả `{ status: "ok" }`.

> Đổi port: sửa `PORT` và `API_URL` trong root `.env`, rồi chạy lại server. Web và extension sẽ tự đọc lại sau khi bạn chạy `pnpm --filter=@leetcode/extension sync:config` (xem `AI/walkthrough/execution.md`).

### Bước 2 — Thử các API chính (không cần code)

- **Xem tất cả đề:** `GET http://localhost:3000/api/problems`
- **Xem 1 đề:** `GET http://localhost:3000/api/problems/1`
- **Lấy đề ngẫu nhiên:** `GET http://localhost:3000/api/problems/random` hoặc `/random/medium`
- **Chạy code:** `POST http://localhost:3000/api/problems/1/run` với body `{ "code": "function(nums, target){...}" }`
- **Thêm đề (extension/web dùng):** `POST http://localhost:3000/api/problems/import` với body là JSON `ProblemClip` (gồm `id`, `title`, `difficulty`, `description`...)
- **Ghi đè đề (extension tự gọi khi trùng ID):** `PUT http://localhost:3000/api/problems/:id` với body `ProblemClip` — trả 200 nếu ghi đè thành công

Bạn có thể thử bằng trình duyệt (GET) hoặc `curl`/Postman (POST).

### Bước 3 — Hiểu luồng import

Khi extension hoặc web gửi `POST /api/problems/import`:
1. Server kiểm tra đủ trường (`id`, `title`, `difficulty`, `description`...) — thiếu sẽ báo 400.
2. Nếu đã tồn tại → trả 409. Extension tự gọi `PUT /api/problems/:id` để ghi đè.
3. Nếu ảnh trong `description` có `<img src="https://...">`, server tự tải về `packages/database/data/assets/<slug>/` và đổi link thành `/assets/...`.
4. Lưu vào DB + bộ nhớ tạm, trả 201 (mới) hoặc 200 (ghi đè).

Bạn không cần làm gì thêm — chỉ cần thấy web hiện đề mới là xong.

## Kết quả mong đợi

- Server tự tạo DB `packages/database/data/leetcode.db` lần đầu chạy (auto-migrate).
- Ảnh được serve tại `GET http://localhost:3000/assets/<slug>/<file>` — mở link này sẽ thấy ảnh.

## Mẹo & xử lý lỗi

- **Server không chạy?** Kiểm tra port 3000 có bị chiếm không, hoặc đổi `PORT` trong `.env`.
- **CORS lỗi ở web?** Server đã bật `Access-Control-Allow-Origin: *` — chỉ cần chắc web gọi đúng `VITE_API_URL`.
- **Import báo 400?** Thường do `description` rỗng hoặc `difficulty` sai — hãy clip lại.
- **Import báo 409?** Đề đã có — extension tự ghi đè qua `PUT /api/problems/:id`, không cần thao tác thêm.
- **CORS lỗi khi PUT?** Đã fix 2026-08-31: server cho phép `GET, POST, PUT, OPTIONS` — cần restart server nếu vừa cập nhật.

## Đọc thêm

- Tổng quan kiến trúc: `AI/ARCHITECTURE.md`
- Chi tiết API: `AI/index/APP_STRUCTURE.md`
- Quyết định chọn clip DOM thay vì API: `AI/context/decisions.md`
