# Dockable Layout + Package State/Tree Redesign

Ngày: 2026-08-31
Nhánh: `feat/dockable-layout`

## Tóm tắt

Biến `apps/web` thành giao diện **IDE-like dockable layout** bằng **FlexLayout** (`flexlayout-react`), đồng thời tái thiết kế `packages/editor` và `packages/problem-engine` sang **state/tree model**. Thêm package mới `@leetcode/layout`.

## Thay đổi

### Package mới: `@leetcode/layout`

Wrap FlexLayout để giữ state/tree model của dockable layout tách khỏi app:

- `src/workspace.ts` — `createDefaultLayout()` tạo default layout tree kiểu IDE (`row → tabset → tab`: Explorer trái weight 25 + cột phải weight 75: Editor+Description trên, Output dưới); `getComponentName`/`getTabConfig`.
- `src/theme.ts` — `flexThemeClass` (alpha_light/alpha_dark), `flexCssOverrides` (CSS var overrides đồng bộ web theme).
- `src/index.ts` — re-export `Layout`, `Model`, `Actions`, `DockLocation`, types.
- 6 tests (`workspace.test.ts`), build + lint pass (kèm `eslint.config.mjs` với `typescript-eslint`).

### `packages/editor` → state/tree

- Thêm `src/editorTree.ts` — `EditorTreeState` (cây file: root/group/file node + activeId), pure ops: `openFile`, `updateCode`, `markSaved`, `closeFile`, `setActive`, `findNode`, `toFlatFiles`, `createEditorTreeFromProblem`, `createFileFromLanguage`.
- Tách `languageTemplates` sang `src/templates.ts` (tránh circular import).
- Giữ nguyên export cũ (`EditorState`, `createEditorState`, `languageTemplates`).
- 11 tests (`editorTree.test.ts`).

### `packages/problem-engine` → state/tree

- Thêm `src/problemTree.ts` — `ProblemTreeState` (byDifficulty, byTag, byId, total), pure ops: `registerProblem`, `removeProblem`, `findProblem`, `listByDifficulty`, `listByTag`, `searchProblems`, `getTags`, `getDifficultyCounts`, `hydrateProblems`.
- `ProblemEngine` giữ **API cũ tương thích** (register/get/getRandom/runTests/runTestsDetailed) + đồng bộ `ProblemTreeState`; thêm `remove`, `hydrate`, `search`, `getTags`, `listByDifficulty`, `findMeta`, `getTree`.
- Server 36 tests + extension 53 tests vẫn pass.
- 10 tests (`problemTree.test.ts`).

### `apps/web` → dockable layout

- Cài `flexlayout-react` + `@leetcode/layout`; cập nhật `vite.config.ts` + `tsconfig.json` alias.
- `WorkspaceProvider` (`workspace/WorkspaceContext.tsx`) — state tập trung (problem, code, results, loading...).
- `workspace/` panels: `ExplorerPanel` (port Sidebar), `EditorPanel` (port CodeEditor + Run + VS Code), `DescriptionPanel` (port description + hints), `OutputPanel` (port TestCaseTabs).
- `workspace/WorkspaceLayout.tsx` — FlexLayout container: `Model.fromJson`/`toJson`, `createDefaultLayout`, factory map component → panel, persist layout vào `localStorage` (`lc:layout:json`) qua `onModelChange` (debounce 500ms), theme class `flexlayout__theme_alpha_*` + CSS var overrides.
- `App.tsx` — Header + `ProblemLoader` (fetch problem → context) + `WorkspaceLayout`; xóa `Layout.tsx`, `Sidebar.tsx`, `ProblemDetail.tsx`.
- `main.tsx` — thêm `WorkspaceProvider`.
- `index.css` — import `flexlayout-react/style/combined.css` + `.flexlayout__theme { position: relative; height: 100% }`.

## Kiểm chứng

- `pnpm -r build` pass (server tsc → dist, web tsc + vite build).
- `pnpm -r test` pass: extension 53, editor 11, javascript-docs 13, layout 6, problem-engine 10, server 36.
- Dev server web chạy 200 + phục vụ `WorkspaceLayout.tsx`.

## Ghi chú

- FlexLayout ESM-only → `packages/layout` + web dùng `moduleResolution: bundler`; server (NodeNext) không import package này.
- `apps/web/dist` bị commit nhầm vào commit web (đang có trong tree) — cần kiểm tra `.gitignore`.
- Layout persist `lc:layout:json`; nếu cần reset, xóa key này khỏi localStorage.
