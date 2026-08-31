# Web Frontend {#web-frontend}

## Giới thiệu {#gioi-thieu}

`apps/web` là SPA dùng **React 18.3 + Vite 5 + Tailwind CSS 4 + React Router DOM 7 + FlexLayout**. Giao diện IDE-like dockable layout: kéo thả tab, resize panel, persist layout.

## Entry {#entry}

```text
apps/web/index.html
  └─ src/main.tsx (BrowserRouter + ThemeProvider + WorkspaceProvider)
       └─ App.tsx (Routes)
            ├─ Header
            └─ /problems/:id → ProblemLoader → WorkspaceLayout
```

## Tính năng {#tinh-nang}

- **Dockable Layout** (FlexLayout): 4 tabs mặc định — Explorer / Editor / Description / Output.
- **Explorer Panel**: danh sách đề từ `GET /api/problems`, tìm kiếm, lọc theo độ khó.
- **Editor Panel** (CodeEditor: contentEditable div + react-syntax-highlighter), nút **Run** (`POST /api/problems/:id/run`, hiển thị `passed/total`) + nút **VS Code** (`POST /api/playground/:slug` → mở `vscode://file/...`).
- **Description Panel**: mô tả HTML (sanitize) + hints (toggle).
- **Output Panel**: TestCaseTabs (Input / Expected / Actual + badge đúng/sai + tổng `passed/total`).
- **Kéo thả tab** giữa các tabset, resize splitter, maximize tabset.
- **Persist layout**: JSON model lưu vào `localStorage` (`lc:layout:json`), khôi phục khi reload.
- **Theme sáng/tối**: CSS variables + `data-theme` + đồng bộ FlexLayout theme class (`flexlayout__theme_alpha_light/dark`) + CSS var overrides.
- **WorkspaceContext**: state tập trung (problem, code, results, loading) cho các panel.

## API client {#api-client}

`src/lib/api.ts`:

- `fetchProblems()` — GET /api/problems
- `fetchProblem(id)` — GET /api/problems/:id
- `runCode(id, code)` — POST /api/problems/:id/run (trả `results[]`)
- `saveToPlayground(slug, code)` — POST /api/playground/:slug

## Ghi chú {#ghi-chu}

- Chưa có Monaco Editor thật.
- Host API đọc từ root `.env` (`VITE_API_URL`), fallback `http://localhost:3000`.
