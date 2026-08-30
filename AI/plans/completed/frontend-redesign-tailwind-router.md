# Plan: Frontend Redesign — Tailwind CSS + React Router + Code Highlighting

## Mục tiêu

Redesign giao diện `apps/web` từ inline-style cơ bản sang giao diện đẹp, hiện đại với:
- Tailwind CSS 4 (styling responsive, utility-first)
- React Router DOM 7 (routing, sidebar + header layout)
- react-syntax-highlighter (code highlighting với CSS variables để đổi theme động)

**Loại bỏ nhập đề thủ công từ LeetCode Clipper:** giờ extension đã POST thẳng tới server (auto-import), web không cần khung "dán JSON → Lưu" nữa. Xóa:
- `components/ProblemImportPaste.tsx`
- `lib/problemClip.ts` (chỉ dùng bởi ProblemImportPaste)
- Không tạo route `/import`
- Web không còn gọi `POST /api/problems/import` (extension đảm nhiệm)

## Thay đổi

### Dependencies (thêm vào `apps/web/package.json`)

```json
"dependencies": {
  "react-router-dom": "^7.18.0",
  "react-syntax-highlighter": "^16.1.0"
},
"devDependencies": {
  "tailwindcss": "^4.3.0",
  "@tailwindcss/vite": "^4.3.0",
  "@types/react-syntax-highlighter": "^15.5.0"
}
```

### Component tree mới

```
main.tsx          → BrowserRouter + App
App.tsx           → Routes (Layout outlet)
  /               → redirect /problems/:first
  /problems/:id   → ProblemDetail

components/
  Layout.tsx      → Header + Sidebar + <Outlet />
  Header.tsx      → Logo, nav links, theme toggle
  Sidebar.tsx     → Problem list (search, filter by difficulty)
  ProblemDetail.tsx → Description (HTML), hints, template, code editor, run
  CodeEditor.tsx  → textarea + syntax-highlighted preview (react-syntax-highlighter)
```

### CSS Variables cho theme động

`src/index.css`:
- `:root` — light theme
- `[data-theme="dark"]` — dark theme
- Biến: `--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-secondary`, `--border`, `--accent`, `--code-bg`, `--sidebar-bg`, `--header-bg`

Tailwind config dùng `var(--...)` để reference các biến này.

### API integration

- `GET /api/problems` → Sidebar list
- `GET /api/problems/:id` → ProblemDetail (description, hints, assets, template)
- `POST /api/problems/:id/run` → Run code (giữ nguyên)
- Web KHÔNG còn gọi `POST /api/problems/import` — việc import do extension POST thẳng

### Luồng

- Sidebar luôn hiển thị bên trái (responsive: collapse trên mobile)
- Click problem → navigate `/problems/:id` → fetch detail → hiển thị
- Header có theme toggle (light/dark dùng `data-theme` attribute + CSS variables)
- Code editor có syntax highlighting động theo theme

## Các bước thực hiện

1. Cài đặt dependencies (`pnpm --filter=@leetcode/web add ...`)
2. Tạo `src/index.css` với Tailwind directives + CSS variables cho theme
3. Cập nhật `vite.config.ts` — thêm `@tailwindcss/vite` plugin
4. Cập nhật `tsconfig.json` — thêm paths cho react-router-dom nếu cần
5. Tạo `components/Layout.tsx` — Header + Sidebar + Outlet
6. Tạo `components/Header.tsx` — Logo, nav, theme toggle
7. Tạo `components/Sidebar.tsx` — problem list, search, filter
8. Tạo `components/ProblemDetail.tsx` — full problem view
9. Tạo `components/CodeEditor.tsx` — code input + syntax highlighting
10. Sửa `App.tsx` — BrowserRouter, Routes
11. Sửa `main.tsx` — StrictMode + App
12. Chạy `pnpm --filter=@leetcode/web build` (typecheck + vite build)
13. Chạy `pnpm --filter=@leetcode/web lint`

## Test

- `pnpm -r build` — typecheck toàn bộ
- `pnpm --filter=@leetcode/web dev` — kiểm tra UI
- Server phải đang chạy để API hoạt động