# Cleanup package editor/layout + luật phân tầng (2026-09-04)

Nhánh: `feat/admin-web-devextreme`

## Bối cảnh

- `packages/editor` là **dead dependency**: `apps/web` khai báo trong `package.json` nhưng không file nào import (`createEditorState`/`EditorState`/`languageTemplates` không dùng ở đâu).
- `packages/layout` chỉ wrap FlexLayout + config tab — thực chất là code giao diện, chỉ `apps/web` dùng → vi phạm nguyên tắc "logic vẽ giao diện đặt trong components, không tách lẻ".
- `apps/web/package.json` khai báo khống `@leetcode/problem-engine` (web không import; engine là domain logic server-side).
- `apps/web` còn import `@leetcode/ai` (chỉ `buildChatGptUrl` + type) → giữ.

## Thay đổi

1. **Xóa `packages/editor`** toàn bộ (src + package.json + tsconfig + README).
2. **Gộp `packages/layout` → `apps/web/src/layout/`**:
   - `workspace.ts`, `theme.ts`, `workspace.test.ts` move nguyên trạng (test import `./workspace.js`/`./theme.js` → không đổi).
   - Bỏ bước re-export `flexlayout-react` (index.ts cũ): 3 file web import trực tiếp `flexlayout-react` (`Model`, `Actions`, `DockLocation`, `Layout`, `TabNode`).
   - `Header.tsx`, `WorkspaceLayout.tsx`, `WorkspaceContext.tsx` đổi import sang `../../layout/*.js`.
3. **Bỏ dep khống** trong `apps/web/package.json`: `@leetcode/editor`, `@leetcode/layout`, `@leetcode/problem-engine`.
4. **Dọn alias/paths**: `apps/web/vite.config.ts`, `apps/web/tsconfig.json`, root `tsconfig.json` (chỉ còn `@leetcode/shared`, `@leetcode/ai` cho web).
5. **Luật phân tầng** thêm vào `AGENTS.md` (mục Kiến trúc) + `AI/CONVENTIONS.md`:
   - Server (`apps/server`) chỉ chứa code API: routes, controllers, plugins, config, wiring — không domain logic.
   - Model/entity dùng chung đặt ở `packages/shared` — server và client import chung, không lệch tên trường, không khai báo trùng.
   - Domain logic độc lập đặt trong `packages/*` (vd `problem-engine`) — server chỉ gọi service từ package.
   - Logic vẽ giao diện đặt trong `apps/web/src/components/` — không tách component web ra package riêng (layout cũng nằm trong `apps/web/src/layout/`).
6. Cập nhật `AI/INDEX.md` (cấu trúc repo bỏ editor/layout, thêm apps/admin).

## Verify

- `pnpm install` — resolved, `-15` packages.
- `pnpm -r build` — pass (web tsc + vite, server tsc, packages type-check).
- `pnpm -r test` — pass: web 14 (gồm 10 layout test mới ở `src/layout`), server 42, extension 53, engine 10, docs 22, ai 6, admin 11.
- `pnpm -r lint` — fail sẵn ở `packages/shared` + `apps/extension` (ESLint 9 thiếu `eslint.config.*` — lỗi có từ trước cleanup, không sửa trong phạm vi này).
- `detect-changes --scope all` — risk low, 0 affected processes.

## Ghi chú

- `solution.util.ts` (stripComments/extractSolutionFunction/wrapSolution) vẫn nằm ở `apps/server/src/services/` — hợp lệ vì server đã có lớp `services/`; nếu sau này client cần chạy test cục bộ thì migrate sang `packages/problem-engine` theo luật mới.
- Layout test vẫn chạy tốt vì vitest web config scan `src/**/*.test.ts`.
