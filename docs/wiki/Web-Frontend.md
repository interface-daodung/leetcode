# Web Frontend {#web-frontend}

## Tổng quan

`apps/web` — SPA React 18.3 + Vite 5 + Tailwind CSS 4 + React Router DOM 7 + FlexLayout (`flexlayout-react`). Giao diện **IDE-like dockable layout**: kéo thả tab, resize panel, persist layout.

- Port: 5173
- Entry: `apps/web/index.html` → `src/main.tsx` → `App.tsx`

## Entry & Providers

```
index.html
  └─ src/main.tsx
       ├─ BrowserRouter
       ├─ ThemeProvider (CSS variables light/dark + localStorage sync)
       └─ WorkspaceProvider (FlexLayout model + state)
            └─ App.tsx (Routes)
```

## Routes

| Route | Component | Mô tả |
|-------|-----------|-------|
| `/` | Redirect → `/problems/1` (hoặc first problem) | Trang chủ |
| `/problems/:id` | `ProblemLoader` → `WorkspaceLayout` | Trang giải bài |

## Layout Components (FlexLayout)

4 tab mặc định trong `WorkspaceLayout`:

| Panel | Component | Vị trí | Chức năng |
|-------|-----------|--------|-----------|
| Explorer | `ExplorerPanel` | Trái (weight 25) | Danh sách đề từ `GET /api/problems`, search, filter difficulty |
| Editor | `EditorPanel` | Trên phải | `CodeEditor` (contentEditable + Prism), nút **Run**, nút **VS Code** |
| Description | `DescriptionPanel` | Dưới Editor | Mô tả HTML (sanitize) + Hints toggle |
| Output | `OutputPanel` | Dưới Description | `TestCaseTabs` (Input/Expected/Actual + badge + passed/total) |

### Dockable Features

- Kéo thả tab giữa các tabset
- Resize splitter
- Maximize/minimize tabset
- Persist: JSON model lưu vào `localStorage` key `lc:layout:json`
- Theme sync: FlexLayout theme class (`flexlayout__theme_alpha_light/dark`) + CSS var overrides

## CodeEditor

- **contentEditable div** + `react-syntax-highlighter` (Prism, theme oneDark/oneLight)
- Render HTML string qua `renderToStaticMarkup`, giữ caret bằng tree-walker
- Chỉ bật autocomplete cho JavaScript (Ctrl+Space)
- Autocomplete từ `@leetcode/javascript-docs` (snippets, members, keywords, API)

## WorkspaceContext

State tập trung cho các panel:
- `problem` — ProblemMeta hiện tại
- `code` — Code đang edit
- `results` — Test results từ `runCode`
- `loading` — Loading state
- `theme` — Light/dark

## API Client (`src/lib/api.ts`)

```typescript
fetchProblems()           // GET /api/problems
fetchProblem(id)          // GET /api/problems/:id
runCode(id, code)         // POST /api/problems/:id/run → { results[] }
saveToPlayground(slug, code) // POST /api/playground/:slug → { path, line, column }
```

Host API: đọc từ root `.env` (`VITE_API_URL`), fallback `http://localhost:3000`.

## Theme

- CSS variables: `:root` (light) + `[data-theme="dark"]` (dark)
- `@custom-variant dark: [data-theme="dark"] &` (Tailwind 4)
- Toggle trong Header → lưu `localStorage` → sync FlexLayout theme class

## Build & Test

```bash
pnpm --filter=@leetcode/web build   # tsc + vite build
pnpm --filter=@leetcode/web test    # Vitest (14 tests)
pnpm --filter=@leetcode/web lint    # ESLint (src --ext .ts,.tsx)
```

## Ghi chú

- Chưa có Monaco Editor thật (upgrade path khi cần tab-stop placeholder)
- Host API cấu hình qua `.env` (root), không hard-code
- `problems/` folder chỉ chứa thư mục rỗng; seed script đã bỏ — dữ liệu qua `engine.register()`