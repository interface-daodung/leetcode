# AI Walkthrough

> Hướng dẫn dùng tính năng AI hint cho người mới.

## Bạn sẽ làm được gì

- Hiểu AI hint dùng để làm gì trong LeetCode Lab.
- Gọi thử API hint ngay cả khi hiện tại chỉ là placeholder.
- Biết hướng phát triển tiếp theo.

## Chuẩn bị

- Server đang chạy (`pnpm --filter=@leetcode/server dev`).
- Không cần key LLM — hiện tại chưa gọi LLM thật.

## Các bước

### Bước 1 — Gọi hint cho 1 đề

Gửi `POST http://localhost:3000/api/problems/1/hint` với body:

```json
{ "code": "function twoSum(nums, target){ return []; }" }
```

Bạn sẽ nhận về ví dụ:

```json
{
  "hints": [{ "type": "approach", "message": "Gợi ý mẫu..." }],
  "explanation": "...",
  "complexity": { "time": "O(n)", "space": "O(1)" }
}
```

Đây là **placeholder** — nội dung chưa thông minh, chỉ để web/server có luồng gọi.

### Bước 2 — Hiểu luồng hiện tại

- Web (tương lai) sẽ có nút **“Gợi ý”** → gửi code hiện tại lên `POST /api/problems/:id/hint` → server gọi `packages/ai` → trả hint → hiển thị.
- Hiện tại `packages/ai` chưa kết nối LLM, nên hint là cố định theo `problemId`.

### Bước 3 — Hướng phát triển (không cần làm ngay)

Theo `AI/STATUS.md` và `AI/PROJECT.md`, dự kiến sẽ tích hợp **Vercel AI SDK** hoặc LLM tương tự để:
- Gợi ý theo hướng tiếp cận, tối ưu, edge-case.
- Giải thích độ phức tạp thời gian/không gian.
- Streaming hint trong lúc bạn code.

## Kết quả mong đợi

- Gọi `/hint` luôn trả 200 với JSON mẫu — dùng để test luồng, chưa cần đánh giá chất lượng hint.

## Mẹo & xử lý lỗi

- **Gọi hint báo 404?** Kiểm tra `id` đề có tồn tại không (`GET /api/problems` để lấy danh sách).
- **Muốn tùy biến hint?** Sửa `packages/ai/src/index.ts` — hiện chỉ là hàm trả về cố định.

## Đọc thêm

- Trạng thái placeholder: `AI/ARCHITECTURE.md` và `AI/STATUS.md`
- Quyết định kiến trúc: `AI/context/decisions.md`
- Package AI: `AI/index/PACKAGE_STRUCTURE.md`
