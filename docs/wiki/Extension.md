# Extension {#extension}

## Tổng quan

`apps/extension` — **Manifest V3 Browser Extension** để clip bài tập LeetCode từ DOM đã render trên `leetcode.com/problems/*`.

- Widget LC draggable (4 trạng thái ảnh PNG + animation)
- DOM clip → `ProblemClip` JSON
- Direct POST `/api/problems/import` + copy clipboard fallback
- Toast SVG động

## Cấu trúc

```
apps/extension/
  manifest.json           # MV3 config
  content.js              # IIFE bundle (esbuild từ src/index.ts)
  style.css               # Widget styles
  src/
    index.ts              # Entry: widget + clip + toast + api
    clipper.ts            # Pure logic: extract DOM → ProblemClip
    parsers/              # 7 file parser thuần cho các phần DOM
    widget/               # Widget state + animation
    toast/                # Toast SVG generation
    api/                  # fetch POST/PUT to server
    api-config.js         # Auto-gen từ root .env (prebuild)
```

## Widget

- 4 trạng thái ảnh PNG: `Idle.png` / `Loading.png` / `Success.png` / `Error.png`
- Load qua `chrome.runtime.getURL("assets/...")` (cần `web_accessible_resources` trong manifest)
- **Squash & Stretch** animation 1.2s khi click:
  ```
  0%   scale(1,1)
  20%  scale(0.75,1.25)
  40%  scale(1.25,0.75)
  55%  scale(0.9,1.1)
  70%  scale(1.05,0.95)
  85%  scale(0.98,1.02)
  100% scale(1,1)
  ```
- Draggable trên trang LeetCode

## Clip Logic (`src/clipper.ts`)

Extract từ DOM:

| Trường | Selector / Nguồn |
|--------|------------------|
| `id` | `a[href^="/problems/"]` → parse |
| `slug` | URL path |
| `title` | DOM heading |
| `difficulty` | `text-difficulty-*` class |
| `tags` | `a[href^="/tag/"]` |
| `description` | `[data-track-load="description_content"]` (fallback `data-qd-rendered-description`, `HTMLContent_html__*`) |
| `template` | 1. `code_editor` DOM → 2. `__NEXT_DATA__.codeSnippets` → 3. monaco `.view-line` → 4. `window.monaco` (duyệt ngược + lọc javascript + regex) |
| `hints` | `div.flex.flex-col` có `Hint N` + `overflow-hidden`/`HTMLContent` |
| `testCases` | 1. Hidden `cm-content` (opacity-0/h-0) → 2. Visible console → 3. `__NEXT_DATA__` (parser `exampleTestcases` string) → 4. Description `<pre>` fallback (regex `Input/Output`) |

### Template Fix (2026-08-31)

LeetCode SPA giữ `window.monaco` models của bài cũ. Thứ tự ưu tiên mới tránh nhiễm cross-problem.

### TestCases Fix (2026-08-31)

Mở rộng 4 nguồn, parser `exampleTestcases` string, fallback description `<pre>`.

## ProblemClip Type

Định nghĩa trong `@leetcode/shared` (extension copy type, không phụ thuộc workspace build):

```typescript
interface ProblemClip {
  id: number;
  slug: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  description: string;  // HTML
  template?: string;    // Code khởi tạo
  hints?: string[];     // HTML hints
  testCases?: TestCase[];
  url?: string;         // Link LeetCode gốc
  clippedAt: string;    // ISO timestamp
}
```

## Direct Import

Sau khi clip hợp lệ (`id>0`, title/description non-empty, difficulty, tags array):

1. **POST** `/api/problems/import` (JSON body) → toast 201/409/error
2. Song song **copy clipboard** (fallback khi server chưa chạy)
3. Nếu 409 (duplicate) → tự **PUT** `/api/problems/:id` ghi đè → toast "Đã ghi đè"

## Toast SVG Động

- Fetch `assets/toast-text.svg` → parse `<g transform="matrix(...)">` lấy translate
- Tìm `<path d="...">` bbox (robust extreme bỏ mỏ neo)
- Tính font-size tối ưu 24-72px (giảm nếu vượt width, wrap nếu vượt height)
- Build `<tspan>` escape XML → thay thẻ `<text>` cũ
- Position: góc trên-phải widget (`bottom = innerHeight - widgetRect.top + 8`, `right = innerWidth - widgetRect.right`)
- Lệch text: trái `-fontSize*0.15`, lên `-fontSize*0.10`

## Config & Build

```bash
pnpm --filter=@leetcode/extension sync:config  # Tạo api-config.js từ root .env + cập nhật manifest host_permissions
pnpm --filter=@leetcode/extension build        # esbuild src/index.ts → content.js (IIFE)
pnpm --filter=@leetcode/extension test         # Vitest + jsdom (53 tests)
```

- `api-config.js` auto-gen từ `scripts/sync-api-url.mjs` (prebuild)
- `manifest.json` thêm `api-config.js` trước `content.js`
- `host_permissions`: localhost + API host (sync script cập nhật)

## Load Unpacked

1. `pnpm --filter=@leetcode/extension sync:config`
2. Chrome/Edge → `chrome://extensions` → Developer mode → Load unpacked → chọn `apps/extension`
3. Mở `leetcode.com/problems/two-sum` → click widget LC → check toast

## Ghi chú

- Chưa publish Chrome Web Store (load unpacked thủ công)
- `content.js` không sửa tay — luôn build từ `src/index.ts`
- CORS PUT: server phải allow PUT (đã fix 2026-08-31)
- `testCases` parsing vẫn có thể cải tiến (Example → structured)