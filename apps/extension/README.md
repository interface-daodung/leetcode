# LeetCode Widget Extension

Browser extension (Manifest V3) hiển thị widget nổi trên `https://leetcode.com/problems/*`.

## Chức năng

- Hiện icon tròn (logo `LeetCode Lab`, ảnh từ `packages/shared/asset/icon`) ở góc phải dưới khi ở trang đề bài LeetCode.
- Click → cắt DOM đề bài (`[data-track-load="description_content"]` + title/difficulty) → làm sạch → copy JSON vào clipboard.
- Kéo thả để di chuyển widget (giới hạn trong viewport).

## Cài đặt (Load unpacked)

1. Mở Chrome → `chrome://extensions/` → bật **Developer mode**.
2. Chạy `pnpm --filter=@leetcode/extension prebuild` để tạo `api-config.js` + copy icon vào `assets/` (hoặc chạy `pnpm --filter=@leetcode/extension sync:icons`).
3. Bấm **Load unpacked** → chọn thư mục `apps/extension`.

## JSON mẫu

```json
{
  "id": 1,
  "slug": "two-sum",
  "title": "Two Sum",
  "difficulty": "easy",
  "tags": [],
  "description": "<p>Given an array...</p>",
  "url": "https://leetcode.com/problems/two-sum/",
  "clippedAt": "2026-08-30T00:00:00.000Z"
}
```

## Phát triển

- Logic thuần: `src/clipper.ts` (có unit test `clipper.test.ts`).
- Widget + clipboard: `content.js` (vanilla JS, không cần build).
- Test: `pnpm --filter=@leetcode/extension test` (vitest + jsdom).

## Lưu ý

- Không gọi LeetCode API, chỉ đọc DOM đã render.
- Nếu LeetCode đổi DOM, cập nhật selector trong `src/clipper.ts` và `content.js`.
