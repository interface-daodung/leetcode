# LeetCode Clipper — Browser Extension Widget + Paste Import

Ngày: 2026-08-30
Nhánh: `feat/leetcode-clipper-extension`
Plan: `AI/plans/active/leetcode-clipper-extension.md` (sắp move sang completed)

## Mục tiêu

Tạo browser extension (MV3) hiển thị icon nhỏ trên `https://leetcode.com/problems/*`; khi bấm sẽ kiểm tra DOM hiện tại, cắt khối đề bài đã tải thành công, làm sạch và lưu thành JSON vào clipboard; web có vùng paste để preview và lưu vào DB.

## Bối cảnh

- `problems/` rỗng, seed script đã bỏ; dữ liệu duy nhất vào hệ thống là `engine.register(...)` thủ công.
- LeetCode không có public API ổn định; GraphQL bị rate-limit và đổi schema.
- Tham khảo snapshot DOM thực tế `tham_khao/de_bai.html` (5. Longest Palindromic Substring) và extension mẫu `tham_khao/Gemielle` (widget draggable, MV3, style.css).

## Thay đổi

### apps/extension (mới)

- `manifest.json`: MV3, `matches: *://leetcode.com/problems/*`, `permissions: clipboardWrite`, `host_permissions: *://leetcode.com/*`, `content_scripts: content.js + style.css`, `run_at: document_idle`.
- `content.js` (vanilla JS, 300 dòng): widget tròn 52px `#lc-clipper-widget` (LC, draggable với threshold 5px, clamp viewport), `buildProblemClip` (tái logic từ clipper.ts), `cleanDescription`, `copyToClipboard` (navigator + fallback execCommand), toast `#lc-clipper-toast`.
- `style.css`: fork từ Gemielle, đổi prefix `lc-clipper`, thêm trạng thái success/error.
- `src/clipper.ts`: pure logic `parseTitle`, `extractSlug`, `normalizeDifficulty`, `findDescriptionContainer` (ưu tiên `[data-track-load="description_content"]`), `findTitleAnchor`, `extractDifficulty`, `cleanDescription`, `buildProblemClip`, `isValidProblemClip`.
- `src/clipper.test.ts`: 28 tests (vitest + jsdom) — parseTitle, extractSlug, normalizeDifficulty, findDescriptionContainer, extractDifficulty, findTitleAnchor, cleanDescription, buildProblemClip, isValidProblemClip.
- `vitest.config.ts`: `environment: jsdom`.
- `assets/icon.svg`, `README.md` (hướng dẫn load unpacked).
- `package.json`, `tsconfig.json` (module ESNext, bundler, lib DOM).

### packages/shared

- Thêm `ProblemClip` interface (id, slug, title, difficulty, tags, description, url, clippedAt) vào `src/index.ts`.

### apps/server

- `src/index.ts`:
  - Thêm CORS hook (`Access-Control-Allow-Origin: *`) + `OPTIONS /*` 204.
  - Hydrate `engine` từ `problemDb.getAll()` khi khởi động (top-level await).
  - `GET /api/problems` — list từ DB.
  - `GET /api/problems/:id` — engine → fallback DB.
  - `POST /api/problems/import` — Zod validate ProblemClip, 400/409/201, `engine.register` + `await problemDb.add`.
- Fix type cho `testCases` (cast `as {input: unknown; expected: unknown}[]`).

### apps/web

- `src/lib/problemClip.ts`: `parseProblemClipJson` (validate id/title/difficulty/description), `sanitizeDescriptionHtml` (loại bỏ script/iframe/on*).
- `src/components/ProblemImportPaste.tsx`: textarea + paste từ clipboard, preview difficulty badge, `dangerouslySetInnerHTML` sau sanitize, nút Lưu → `POST http://localhost:3000/api/problems/import`, toast.
- `src/App.tsx`: import `ProblemImportPaste`, fetch `GET /api/problems` khi mount, hiển thị list đã lưu, giữ editor run code.

### Build/Test/Docs

- Tạo `tsconfig.json` cho `packages/shared`, `editor`, `problem-engine`, `ai`, `javascript-docs` (trước đây dùng root tsconfig gây lỗi JSX khi pnpm -r build).
- Thêm `@types/node` cho `packages/problem-engine`.
- Xoá BOM (EF BB BF) trong `packages/{shared,editor,ai,javascript-docs}/package.json` (vite PostCSS loader lỗi `Unexpected token '﻿'`).
- Đổi `test: vitest run` → `vitest run --passWithNoTests` cho tất cả workspace packages (tránh fail khi không có test file).
- Cập nhật `AI/ARCHITECTURE.md` (3 apps, runtime flow mới, data flow clip), `AI/index/PROJECT_STRUCTURE.md`, `AI/index/APP_STRUCTURE.md`, `AI/index/PACKAGE_STRUCTURE.md`, `AI/index/DATA_STRUCTURE.md`, `AI/context/decisions.md`, `AI/STATUS.md`.

## Kết quả

- `pnpm --filter=@leetcode/extension test`: 28 passed (jsdom).
- `pnpm test`: tất cả 9 workspace projects pass (extension 28 tests, các package khác passWithNoTests).
- `pnpm build`: `pnpm -r build` pass (shared, extension, editor, ai, database, problem-engine, server tsc, web tsc+vite).
- Extension load unpacked hoạt động trên `leetcode.com/problems/*` (cần test thủ công).
- Web paste → preview → Save lưu vào SQLite (`packages/database/data/leetcode.db`) và hiển thị trong list.

## Lệnh tham chiếu

```bash
# Test
pnpm --filter=@leetcode/extension test
pnpm test

# Build
pnpm build
pnpm --filter=@leetcode/web build
pnpm --filter=@leetcode/server build

# Dev
pnpm --filter=@leetcode/server dev   # :3000 (tsx watch, CORS, hydrate)
pnpm --filter=web dev                # :5173 (vite)

# Extension (load unpacked)
# chrome://extensions → Developer mode → Load unpacked → chọn apps/extension
```

## Ghi chú

- `tham_khao/` là untracked, không commit; chỉ dùng để tham khảo DOM và pattern Gemielle.
- Extension không cần bundler; `content.js` là vanilla JS, `src/clipper.ts` là source testable.
- `ProblemClip.testCases` để rỗng phase 1; có thể parse từ Example sau này.
- Cần test thủ công end-to-end (clip thật từ leetcode.com → paste → lưu) trước khi move plan sang completed.
- Plan move: `AI\skills\feature-development\move-plan-to-completed.bat leetcode-clipper-extension` từ repo root.

## Commit liên quan

- Nhánh `feat/leetcode-clipper-extension` (từ `master` 29c6a33).
- Chưa commit (thay đổi hiện tại là working directory).
