# Web Frontend {#web-frontend}

## Giới thiệu {#gioi-thieu}

`apps/web` là SPA dùng **React 18.3 + Vite 5 + Tailwind CSS 4 + React Router DOM 7**. Giao diện hiện đại với sidebar, header và chi tiết đề bài 2 cột.

## Entry {#entry}

```text
apps/web/index.html
  └─ src/main.tsx (BrowserRouter + ThemeProvider)
       └─ App.tsx (Routes)
            ├─ Layout (Header + Sidebar + <Outlet />)
            └─ /problems/:id → ProblemDetail
```

## Tính năng {#tinh-nang}

- Sidebar: danh sách đề từ `GET /api/problems`, tìm kiếm, lọc theo độ khó.
- ProblemDetail: mô tả HTML (trái) + code editor (phải).
- CodeEditor: contentEditable div + react-syntax-highlighter (highlight trực tiếp, selection tự nhiên, không lệch dòng).
- Nút **Run**: gọi `POST /api/problems/:id/run`, hiển thị `passed/total`.
- Nút **VS Code**: gọi `POST /api/playground/:slug` → ghi `playground/<slug>.js` → mở `vscode://file/...`.
- **TestCaseTabs**: tabs dưới code, mỗi tab hiển thị Input / Expected / Actual + badge đúng/sai + tổng `passed/total`.
- Theme sáng/tối: CSS variables + `data-theme`, lưu localStorage.

## API client {#api-client}

`src/lib/api.ts`:

- `fetchProblems()` — GET /api/problems
- `fetchProblem(id)` — GET /api/problems/:id
- `runCode(id, code)` — POST /api/problems/:id/run (trả `results[]`)
- `saveToPlayground(slug, code)` — POST /api/playground/:slug

## Ghi chú {#ghi-chu}

- Chưa có Monaco Editor thật, state management.
- Host API đọc từ root `.env` (`VITE_API_URL`), fallback `http://localhost:3000`.
