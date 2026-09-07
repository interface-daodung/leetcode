# Extension — Component-Based refactor + esbuild bundle (2026-08-31)

Nhánh: `feat/widget-animated-images` (tiếp diễn)

## Mục tiêu

Chia nhỏ `src/clipper.ts` (907 dòng) và `content.js` (1093 dòng) thành cấu trúc component-based dễ bảo trì, đồng thời thêm esbuild bundle để `content.js` sinh tự động từ TypeScript (không còn duplicate JS thủ công).

## Bối cảnh & quyết định

- Ban đầu đề xuất FSD (Feature-Sliced Design) đầy đủ, nhưng thảo luận lại: dự án ~2000 dòng, 1 người bảo trì → **FSD là over-engineering**. Chọn **Component-Based** (nhóm theo chức năng, không theo layer ceremony) — đúng tinh thần CONVENTIONS ("tránh over-engineering").
- `content.js` trước đây viết tay trùng lặp logic với `src/clipper.ts` (đồng bộ thủ công, dễ quên) → **build là bắt buộc**: esbuild bundle `src/index.ts` → `content.js`.

## Cấu trúc mới

```
apps/extension/src/
├── shared.ts          # types, asset URLs, API_BASE, copyToClipboard, DOM IDs
├── chrome.d.ts        # khai báo chrome.runtime.getURL (không cần @types/chrome)
├── parsers/
│   ├── title.ts       # parseTitle, extractSlug
│   ├── difficulty.ts  # normalizeDifficulty, extractDifficulty
│   ├── tags.ts        # extractTags
│   ├── description.ts # findDescriptionContainer, findTitleAnchor, cleanDescription
│   ├── hints.ts       # extractHints
│   ├── template.ts    # extractTemplate, findCodeSnippetInJson
│   └── testcases.ts   # extractTestCases + findTestCasesInJson + parseExampleTestcasesString + extractTestCasesFromDescription + buildTestCasesFromLines
├── clip.ts            # buildProblemClip (orchestrator), isValidProblemClip, re-export parsers
├── widget/
│   ├── create.ts      # createWidget (div + img Idle)
│   ├── drag.ts        # makeDraggable(el, onClick), keepInBounds
│   ├── state.ts       # setWidgetState (4 trạng thái), playSquashStretch
│   ├── types.ts       # WidgetHandleClip
│   └── index.ts
├── toast/
│   ├── create.ts      # ensureToast, resetToast
│   ├── svg.ts         # generateToastSvg (fetch template, robust bbox, font 24-72px, wrap, tspan)
│   ├── show.ts        # showToast (position top-right widget, fallback 3s)
│   └── index.ts
├── api/
│   ├── validate.ts    # isValidClipForPost
│   ├── post.ts        # postToServer (POST → 409 → PUT ghi đè)
│   └── index.ts
├── index.ts           # entry: handleClip, init, SPA hook
└── clipper.test.ts    # 53 tests (đổi import sang parsers/ + clip.ts)
```

## Thay đổi chính

### 1. Tách parsers (từ clipper.ts 907 dòng)

- 7 file parser thuần, mỗi file 1 trách nhiệm, import types từ `../shared.js`.
- `description.ts` giữ `findTitleAnchor` (cần `parseTitle` từ title.ts).
- `testcases.ts` giữ helper private (`parseJsonLine`, `findTestCasesInJson`...) — chỉ export `extractTestCases`.

### 2. Tách UI features (từ content.js 1093 dòng)

- `widget/`: create/drag/state tách rời, `makeDraggable` nhận callback `onClick` (dependency injection thay vì gọi trực tiếp `handleClip` — giúp test và tách vòng phụ thuộc).
- `toast/`: `svg.ts` giữ nguyên logic generateToastSvg, thêm types chuẩn (fix `counts.get(v) ?? 0`, `textMatch.index ?? 0` cho strict mode).
- `api/`: validate + post tách rời, `post.ts` import `showToast` từ toast feature.

### 3. Entry point `index.ts`

- `handleClip()`: orchestrator — clip → clipboard → validate → toast loading → postToServer → toast kết quả + widget state.
- `init()`: createWidget + makeDraggable(widget, handleClip).
- SPA hook: setInterval 1s theo dõi URL.

### 4. Build pipeline

- `scripts/bundle.mjs`: esbuild `src/index.ts` → `content.js` (IIFE, es2022, browser, không minify, có comment path).
- `package.json`: thêm `esbuild ^0.25.0` devDependency; `build: tsc --noEmit && node scripts/bundle.mjs`.
- `content.js` sinh ra ~42KB (1095 dòng IIFE) — **không sửa tay nữa**.
- Thêm `src/chrome.d.ts` khai báo `chrome.runtime.getURL` (tránh cài `@types/chrome` đầy đủ).

### 5. Test

- `clipper.test.ts` đổi import từ `./clipper.js` sang `./parsers/*.js` + `./clip.js`.
- 53 tests pass nguyên xi, không đổi assertion.

## Kết quả

- `pnpm -r build` pass (extension: tsc + esbuild).
- `pnpm --filter=@leetcode/extension test` → 53 pass.
- `node --check content.js` → syntax OK.
- Không còn duplicate code giữa `clipper.ts` ↔ `content.js`.
- Mỗi file < 200 dòng.

## Lệnh

```bash
pnpm --filter=@leetcode/extension build   # tsc + sync-api-url + esbuild bundle
pnpm --filter=@leetcode/extension test    # 53 tests
# Sau khi build → chrome://extensions → Reload → F5 leetcode.com
```

## Ghi chú

- **content.js không sửa tay** — mọi thay đổi vào `src/`, rồi build.
- `shared.ts` declare `LC_API_BASE` (inject bởi api-config.js trước content.js).
- esbuild IIFE bọc toàn bộ trong `(() => { ... })()` — không leak biến toàn cục, giữ hành vi cũ.
- Nếu cần source map cho debug: thêm `sourcemap: true` trong `scripts/bundle.mjs`.
