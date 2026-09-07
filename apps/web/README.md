# @leetcode/web

React 18 + Vite frontend cho LeetCode Lab.

## Tính năng

- Layout Header + Sidebar + chi tiết đề bài (React Router DOM 7)
- Sidebar: danh sách đề từ DB, tìm kiếm, lọc theo độ khó (Easy/Medium/Hard)
- Chi tiết đề: mô tả HTML, tags, gợi ý (hints), template, editor + Run
- Code editor có syntax highlighting (react-syntax-highlighter, oneDark/oneLight)
- Theme sáng/tối bằng CSS variables (data-theme + Tailwind @custom-variant dark)
- Nhập đề tự động qua extension (đã bỏ nhập tay)

## Chạy

```bash
pnpm dev
```

Web chạy tại `http://localhost:5173` (cần server `pnpm --filter=@leetcode/server dev`).

## Entry

```text
index.html → src/main.tsx (BrowserRouter + ThemeProvider) → App.tsx (Routes) → Layout → ProblemDetail
```

## Công nghệ

- React 18.3, Vite 5, `@vitejs/plugin-react`
- Tailwind CSS 4 (`@tailwindcss/vite`), React Router DOM 7
- react-syntax-highlighter (PrismLight)

## Tài liệu

- [Web Frontend](../../docs/features/web-frontend.md)

## Ghi chú

- Code chạy qua server `POST /api/problems/:id/run` (test case chạy cục bộ bằng `new Function`).
- Chưa có Monaco Editor thật, state management.
