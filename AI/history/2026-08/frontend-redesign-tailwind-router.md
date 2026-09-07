# Frontend Redesign — Tailwind CSS + React Router + Code Highlighting

Ngày: 2026-08-31

## Bối cảnh

`apps/web` chỉ có inline-style cơ bản (một trang, textarea thường, danh sách problem dạng thẻ). Cần giao diện đẹp, hiện đại với routing, sidebar, header và hiển thị code có màu. Đồng thời, vì extension đã POST thẳng tới server nên web không cần khung nhập đề thủ công nữa.

## Thay đổi

### Dependencies mới (`apps/web`)

- `react-router-dom` ^7.18 — routing.
- `react-syntax-highlighter` ^16.1 + `@types/react-syntax-highlighter` — code highlighting (PrismLight, register javascript/typescript/python/css).
- `tailwindcss` ^4.3 + `@tailwindcss/vite` ^4.3 — styling utility-first.

### Component tree

- `main.tsx`: BrowserRouter + ThemeProvider → App.
- `App.tsx`: Routes (Layout) — `/` và `/problems` redirect về `/problems/:id`, `*` redirect.
- `Layout.tsx`: Header + Sidebar + `<Outlet />`; mobile có drawer + FAB mở sidebar.
- `Header.tsx`: logo LC, nav (Problems, LeetCode ↗), nút theme toggle.
- `Sidebar.tsx`: list problems (GET /api/problems), ô tìm kiếm, filter All/Easy/Medium/Hard kèm count, badge difficulty, tags.
- `ProblemDetail.tsx`: fetch GET /api/problems/:id → title, difficulty badge, tags, link LeetCode, description (sanitize + dangerouslySetInnerHTML), details hints (sanitize), CodeEditor + nút Run (POST /:id/run), hiển thị `passed/total`.
- `CodeEditor.tsx`: textarea transparent chồng lên `SyntaxHighlighter` (PrismLight), theme oneDark/oneLight theo theme, scroll đồng bộ qua ref.
- `DifficultyBadge.tsx`: badge màu theo easy/medium/hard (kèm dark variant).
- `lib/api.ts`: fetchProblems / fetchProblem / runCode (API_BASE từ VITE_API_URL, fallback localhost:3000).
- `lib/theme.tsx`: ThemeProvider + useTheme; lưu `data-theme` trên `documentElement` + localStorage (`leetcode-lab-theme`), khởi tạo theo `prefers-color-scheme`.
- `lib/sanitize.ts`: tách từ `lib/problemClip.ts` cũ (sanitize HTML).

### Theme động (CSS variables)

- `src/index.css`: `:root` (light) + `[data-theme=dark]` (dark) định nghĩa biến `--bg-primary`, `--text-primary`, `--border`, `--accent`, `--code-bg`, ...
- `@theme inline` map biến sang token Tailwind (`bg-bg-primary`, `text-text-primary`, `border-border`, `bg-accent`, ...).
- `@custom-variant dark` buộc variant `dark:` theo `[data-theme=dark]` thay vì OS `prefers-color-scheme`.

### Loại bỏ nhập đề thủ công

- Xóa `components/ProblemImportPaste.tsx` và `lib/problemClip.ts`.
- Web không còn gọi `POST /api/problems/import` (extension đảm nhiệm).
- `sanitizeDescriptionHtml` chuyển sang `lib/sanitize.ts` (ProblemDetail + hints vẫn dùng).

## Kết quả

- `pnpm -r build` pass (tất cả workspace).
- Server 11 tests pass.
- Web dev server chạy ok (port 5173, fallback 5174 nếu bận).
- Smoke test: `GET http://localhost:3000/api/problems` trả list problem; web render index.

## Ghi chú

- Lint web đang lỗi sẵn do repo chưa có `eslint.config.*` (không liên quan thay đổi này).
- Vite cảnh báo non-relative paths trong root `tsconfig.json` (pre-existing, không do change này).
