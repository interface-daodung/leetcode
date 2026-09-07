# Plan: Tách Extension sang Component-Based structure + build esbuild

## Mục tiêu

Chia nhỏ `apps/extension/src/clipper.ts` (907 dòng) và `apps/extension/content.js` (1093 dòng) thành cấu trúc component-based (nhóm theo chức năng) để dễ bảo trì, và thêm **esbuild bundle** để `src/*.ts` → `content.js` thay cho việc viết tay JS duplicate.

## Bối cảnh & quyết định

- FSD đầy đủ là over-engineering cho dự án ~2000 dòng, 1 người bảo trì.
- Chọn **Component-Based**: nhóm theo chức năng, không theo layer FSD ceremony.
- **Build là bắt buộc**: thêm esbuild để không duplicate code JS thủ công.

## Cấu trúc mới

```
src/
├── shared.ts        # types (Difficulty, TestCase, ProblemClip), asset urls, API_BASE
├── parsers/         # Logic thuần DOM parsing (test với jsdom)
│   ├── title.ts     # parseTitle, extractSlug
│   ├── difficulty.ts# normalizeDifficulty, extractDifficulty
│   ├── tags.ts      # extractTags
│   ├── description.ts # findDescriptionContainer, cleanDescription
│   ├── hints.ts     # extractHints
│   ├── template.ts  # extractTemplate, findCodeSnippetInJson
│   └── testcases.ts # extractTestCases + các helper
├── clip.ts          # buildProblemClip, isValidProblemClip (orchestrator)
├── widget/          # UI widget
│   ├── create.ts    # createWidget
│   ├── drag.ts      # makeDraggable, keepInBounds
│   └── state.ts     # setWidgetState, playSquashStretch
├── toast/           # UI toast
│   ├── create.ts    # ensureToast
│   ├── svg.ts       # generateToastSvg (port sua_svg.js)
│   └── show.ts      # showToast
├── api/             # API client
│   ├── validate.ts  # isValidClipForPost
│   └── post.ts      # postToServer (POST + retry PUT)
├── index.ts         # entry: init, handleClip, SPA hook
└── clipper.test.ts  # giữ nguyên, đổi import
```

## Thay đổi

### 1. shared.ts
- `Difficulty`, `TestCase`, `ProblemClip` types.
- `getAssetUrl`, asset paths (Idle/Loading/Success/Error/toast-text).
- `API_BASE` từ `LC_API_BASE`.

### 2. parsers/
- 7 file, mỗi file 1 chức năng parse thuần.
- Tách từng function từ `clipper.ts` giữ nguyên logic.

### 3. clip.ts
- `buildProblemClip(doc, url)` — orchestrator dùng parsers.
- `isValidProblemClip` — validate.

### 4. widget/
- `create.ts`: tạo widget + img idle.
- `drag.ts`: draggable + keepInBounds.
- `state.ts`: setWidgetState, playSquashStretch.

### 5. toast/
- `create.ts`: ensureToast.
- `svg.ts`: generateToastSvg (fetch SVG, parse, tspan, position).
- `show.ts`: showToast.

### 6. api/
- `validate.ts`: isValidClipForPost.
- `post.ts`: postToServer.

### 7. index.ts
- `handleClip()`: orchestrator dùng clip → api → toast → widget.
- `init()`: DOM ready → createWidget + ensureToast + makeDraggable.
- SPA hook: setInterval theo dõi URL.

### 8. package.json
- Thêm `esbuild` devDependency.
- `build`: `tsc --noEmit && esbuild src/index.ts --bundle --format=iife --outfile=content.js --target=es2022 --platform=browser`.
- `prebuild`: giữ `node scripts/sync-api-url.mjs`.

### 9. clipper.test.ts
- Đổi import từ `./clipper.js` sang các module mới.

### 10. Xóa
- Xóa `src/clipper.ts`, `src/clipper.test.ts` (đổi thành test mới nếu cần).
- Xóa `content.js` (được build).

## Kết quả

- `pnpm -r build` pass, esbuild tạo `content.js`.
- `pnpm --filter=@leetcode/extension test` 53 pass.
- Mỗi file < 200 dòng, dễ bảo trì.

## Lệnh

```bash
pnpm --filter=@leetcode/extension build
pnpm --filter=@leetcode/extension test
```

## Ghi chú

- `content.js` sinh tự động, không sửa tay.
- Giữ nguyên asset path.
- Widget/toast không test (UI động).
