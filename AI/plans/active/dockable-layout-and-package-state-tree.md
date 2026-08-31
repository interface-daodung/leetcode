# Plan: Dockable Layout (IDE-like) + Package State/Tree Redesign

## Mục tiêu

Biến `apps/web` thành giao diện **IDE-like dockable layout** bằng thư viện **FlexLayout** (`flexlayout-react`), đồng thời tái thiết kế `packages/editor` và `packages/problem-engine` theo mô hình **state/tree model** thống nhất.

Yêu cầu của user:
- **Dockable Layout** giống IDE: tabs có thể kéo thả (drag & drop), panels resizable, layout tùy chỉnh được.
- Layout biểu diễn bằng **tree/model** (row → tabset → tab), KHÔNG phải một đống `<div>`.
- Khi user kéo tab sang vị trí khác → **layout tree thay đổi** → persist để lần sau mở lại giữ nguyên.
- Dùng thư viện **FlexLayout npm** (user đã chọn).
- Redesign **`problem-engine`** và **`editor`** sang **state/tree model**.

## Bối cảnh hiện tại

- `apps/web` hiện dùng layout `<div>` cứng: `Layout.tsx` (Header + Sidebar + Outlet) + `ProblemDetail.tsx` (2 cột: description trái / editor phải).
- `packages/editor` — **dead dependency**: `@leetcode/web` khai báo nhưng không file nào import (`createEditorState`/`EditorState`/`languageTemplates` không dùng).
- `packages/problem-engine` — **có dùng thật**: `@leetcode/server` (import `engine` qua `services/problem.service.ts`) và `@leetcode/web` (khai báo nhưng chưa import trực tiếp — chỉ trong `package.json`/`vite.config.ts`/`tsconfig.json`). API class: `register/get/getRandom/runTests/runTestsDetailed` + singleton `engine`. Test server mock đúng bộ API này.
- `packages/shared` — có `ProblemMeta`, `TestCase`, `Difficulty`. `ProblemMeta` đang là model phẳng (mọi thứ trong một object).
- Server test `problem.service.test.ts` dùng `createEngineMock()` với bộ method `{register, get, getRandom, runTests, runTestsDetailed}`.

## Quyết định kiến trúc

### 1. FlexLayout (dockable layout)

- Package npm: **`flexlayout-react`** (bản mới nhất, hiện 0.10.x — ESM-only, types kèm sẵn, MIT).
- Import: `import { Layout, Model, Actions, DockLocation } from "flexlayout-react"` + `import "flexlayout-react/style/combined.css"`.
- Model là **tree**: `Model.fromJson(json)`; khi user kéo tab / resize, FlexLayout tự cập nhật tree nội bộ → lấy lại bằng `model.toJson()`.
- **Persist layout**: lưu JSON layout vào `localStorage` (`lc:layout:json`), khôi phục khi load; nếu chưa có thì dùng default tree.
- Theme động: dùng `combined.css` + đổi `className` trên container (`flexlayout__theme_alpha_light` ↔ `flexlayout__theme_alpha_dark`) theo `useTheme`.
- Đồng bộ màu với CSS variables hiện có qua `--flexlayout-*` overrides (`:root` / `[data-theme=dark]`).
- `<Layout>` phải nằm trong container có `position: relative` + `height: 100%`.

### 2. Package `@leetcode/layout` (mới)

Wrap FlexLayout thành package nội bộ để các app dùng chung và giữ state/tree model ở một chỗ:

- `packages/layout/src/index.ts` — re-export: `FlexLayout` React component, `Model`, `Actions`, `DockLocation`, types (`IJsonModel`, `TabNode`, ...).
- `packages/layout/src/workspace.ts` — helper tạo default model + factory map component-name → React component.
- `packages/layout/src/theme.ts` — ánh xạ `theme` (light/dark) → FlexLayout theme class + CSS variable overrides.

> Quyết định: vì `@leetcode/web` là app duy nhất dùng dockable layout hiện tại, và FlexLayout là thư viện React, wrap package `@leetcode/layout` để giữ "state/tree model" tách khỏi app (đúng yêu cầu thiết kế lại packages). Không thêm vào `shared` vì `shared` là types thuần, không nên phụ thuộc React/FlexLayout.

### 3. `packages/editor` → state/tree model

Tái thiết kế thành **EditorTree model** — editor state là một cây đa file giống IDE:

```ts
interface EditorNode {
  id: string;
  name: string;            // tên file / tab
  language: string;
  code: string;
  dirty: boolean;          // chưa lưu
  savedAt?: number;
  children?: EditorNode[]; // cây: group/directory → file
}

interface EditorTreeState {
  root: EditorNode;                 // nút gốc (container)
  activeId: string;                 // node đang active
  // operations (pure — trả state mới, không mutate)
  openFile(state, id, name, language, code): EditorTreeState;
  updateCode(state, id, code): EditorTreeState;
  closeFile(state, id): EditorTreeState;
  setActive(state, id): EditorTreeState;
  findNode(state, id): EditorNode | undefined;
  toFlatFiles(state): EditorNode[]; // flatten để feed vào FlexLayout tabs
}
```

- **Pure reducer style** (mỗi thao tác trả `EditorTreeState` mới — immutable, dễ test + tích hợp React).
- Giữ lại export cũ (`EditorState`, `createEditorState`, `languageTemplates`) **tối thiểu** để không phá gì; thêm model mới là chính.
- `languageTemplates` giữ nguyên (dùng cho file mới).

### 4. `packages/problem-engine` → state/tree model

Giữ API class `ProblemEngine` **tương thích ngược** (server + test phụ thuộc) nhưng thêm tầng **tree model** cho dữ liệu:

- **State**: `ProblemTreeState` — cây tổ chức problems theo `difficulty` (hoặc theo `tags`):

```ts
interface ProblemNode {
  id: number;
  meta: ProblemMeta;
  children?: ProblemNode[]; // theo tag nếu cần
}

interface ProblemTreeState {
  byDifficulty: Record<Difficulty, ProblemNode[]>;
  byTag: Map<string, ProblemNode[]>;
  total: number;
}
```

- **Operations (pure)**: `registerProblem(state, problem): ProblemTreeState`, `removeProblem`, `findById`, `getByDifficulty`, `search(query, filter)`, `getTags()`.
- **Class `ProblemEngine` giữ nguyên method signature** nhưng nội bộ dùng tree model:
  - `register(problem)` → cập nhật tree + `void problemDb.add(problem)`.
  - `get(id)` / `getRandom(difficulty)` / `runTests` / `runTestsDetailed` — giữ nguyên (server/test không đổi).
  - Thêm method tree-aware: `getTree()`, `search(query, filter)`, `getTags()`, `listByDifficulty(difficulty)`.
- `ProblemMeta` trong `@leetcode/shared` — thêm (optional, không phá) field cần cho tree: `difficulty` đã có; giữ nguyên.

### 5. `apps/web` — tích hợp dockable layout

- Layout mới dùng FlexLayout thay cho cột `<div>` cứng trong `ProblemDetail`.
- **Tabs / Panels**:
  - **Explorer** (danh sách problem — port từ `Sidebar.tsx`) — tabset trái.
  - **Editor** (code editor — port từ `CodeEditor.tsx` + header Run/VS Code) — tabset giữa.
  - **Description** (đề bài + hints — port từ `ProblemDetail.tsx` phần trái) — tabset phải (có thể đóng/mở lại).
  - **Output / Test Cases** (kết quả run — port `TestCaseTabs.tsx`) — tabset dưới.
- **Factory**: map component name → React component (theo node config).
- Kéo thả tab → FlexLayout cập nhật tree → `onModelChange` → persist JSON → localStorage.
- `Header.tsx` giữ nguyên (logo + theme toggle); nút ẩn/hiện sidebar có thể đổi thành toggle "Explorer tab".
- Giữ React Router: route `/problems/:id` vẫn active tab Editor + load problem; `Layout` bọc FlexLayout.

### 6. Không thay đổi

- `@leetcode/server` API endpoints + controller/service logic.
- `@leetcode/database`, `@leetcode/shared` (trừ thêm optional field nếu cần), `@leetcode/ai`, `@leetcode/javascript-docs`, `@leetcode/extension`.
- Cơ chế resolve `workspace:*` + Vite alias.

## Các bước thực hiện

### Phase A — Package `@leetcode/layout`

1. `packages/layout/package.json` — name `@leetcode/layout`, deps `@leetcode/shared`, `react`, `react-dom`, `flexlayout-react`; dev `typescript`, `vitest`, `eslint`, `@types/react`.
2. `packages/layout/tsconfig.json` — extends root, `"moduleResolution": "bundler"` (FlexLayout ESM), strict.
3. `packages/layout/src/workspace.ts` — `createDefaultLayout()` trả `IJsonModel` (row → 2 tabset: Explorer trái weight 25, Editor+Description phải weight 75; Output dưới), `registerComponents(factory)`.
4. `packages/layout/src/theme.ts` — `flexThemeClass(theme)`, `flexCssOverrides(theme)`.
5. `packages/layout/src/index.ts` — re-export `Layout`, `Model`, `Actions`, `DockLocation`, types, helpers.
6. Test: `workspace.test.ts` (default model có đúng node tree; `toJson` round-trip).

### Phase B — `packages/editor` state/tree

1. Refactor `packages/editor/src/index.ts` → thêm `editorTree.ts` (model + pure operations) + giữ exports cũ.
2. Test: `editorTree.test.ts` — open/update/close/setActive/findNode/toFlatFiles.

### Phase C — `packages/problem-engine` state/tree

1. Thêm `problemTree.ts` (tree model + pure ops) + tích hợp vào `ProblemEngine`.
2. Giữ nguyên API cũ — server test không đổi.
3. Test: `problemTree.test.ts` — register/remove/search/listByDifficulty/getTags; `engine.test.ts` giữ nguyên runTests.

### Phase D — `apps/web` dockable layout

1. `pnpm --filter=@leetcode/web add flexlayout-react` + `@leetcode/layout@workspace:*`.
2. Cập nhật `vite.config.ts` + `tsconfig.json` alias `@leetcode/layout`.
3. Tạo `components/workspace/`:
   - `WorkspaceLayout.tsx` — FlexLayout container + theme class + persist/restore model (localStorage).
   - `ExplorerPanel.tsx` — port Sidebar (search/filter/list) thành panel.
   - `EditorPanel.tsx` — port CodeEditor + Run/VS Code header.
   - `DescriptionPanel.tsx` — port description + hints.
   - `OutputPanel.tsx` — port TestCaseTabs.
   - `factory.tsx` — map component name → panel.
4. Sửa `ProblemDetail.tsx` → chỉ render data + các panel trong FlexLayout (bỏ 2 cột `<div>`).
5. `Layout.tsx` — bọc FlexLayout container (position relative, height 100%).
6. `Header.tsx` — nút toggle Explorer tab (mở/đóng qua model action) thay cho sidebar toggle cũ.
7. Persist: `useEffect` lắng nghe model change → `localStorage.setItem("lc:layout", JSON.stringify(model.toJson()))`; restore khi mount.
8. Sync theme: đổi `flexlayout__theme_*` class theo `useTheme`.

### Phase E — Docs & build

1. Update `AI/index/APP_STRUCTURE.md`, `PACKAGE_STRUCTURE.md`, `AI/ARCHITECTURE.md`, `AI/walkthrough/frontend.md`.
2. `pnpm -r build` (typecheck) — fix lỗi phát sinh.
3. `pnpm -r lint`, `pnpm -r test` — tất cả tests pass.
4. Ghi history `AI/history/2026-08/dockable-layout-package-state-tree.md`.

## Test

- `pnpm -r build` — typecheck toàn bộ workspace.
- `pnpm -r test` — tất cả tests pass (server problem.service.test.ts không đổi).
- `pnpm -r lint`.
- Manual: `pnpm --filter=@leetcode/server dev` + `pnpm dev` → mở `localhost:5173`:
  - Kéo thả tab giữa các tabset → layout đổi.
  - Resize splitter.
  - Reload trang → layout được khôi phục từ localStorage.
  - Theme sáng/tối đồng bộ FlexLayout.

## Rủi ro / Lưu ý

- **FlexLayout ESM-only**: `packages/layout` + `apps/web` dùng `moduleResolution: bundler`; server (NodeNext) KHÔNG import package này → không ảnh hưởng.
- **Đừng phá API `ProblemEngine`**: server + test đang phụ thuộc; thêm method mới, không đổi signature cũ.
- **Persist layout đúng cách**: tránh ghi localStorage mỗi render; chỉ ghi khi có thay đổi cấu trúc (`onModelChange`/`onAction`).
- **CSS**: FlexLayout dùng CSS riêng; đảm bảo không xung đột Tailwind (scoped qua container class).
- `combined.css` là một file nhập tất cả theme; đổi theme bằng class trên container.

## Kết quả mong đợi

- `apps/web` hiển thị **IDE-like dockable layout** (Explorer / Editor / Description / Output) — kéo thả + resize + persist.
- `packages/editor` và `packages/problem-engine` có **state/tree model** rõ ràng, pure, có test.
- Package mới `@leetcode/layout` tách model layout khỏi app.
- Toàn bộ build/lint/test pass.
