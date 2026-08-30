# LeetCode Clipper — Browser Extension Widget + Paste Import

Trạng thái: **planning** (2026-08-30)
Nhánh: `feat/leetcode-clipper-extension`
Tác giả: planning phase — chưa implement

---

## 1. Mục tiêu

Tạo một **browser extension (Manifest V3)** hoạt động như widget trên `https://leetcode.com/problems/*`:

- Hiển thị icon nhỏ (floating widget) chỉ khi ở trang đề bài LeetCode.
- Khi bấm icon: kiểm tra DOM hiện tại, **cắt đúng khối đề bài đã tải thành công**, làm sạch, dựng JSON, **copy vào clipboard**.
- Phía `apps/web` cung cấp vùng **paste JSON** → preview đề bài → lưu vào DB (`engine.register` + SQLite) để hiển thị như problem nội bộ.
- Toàn bộ luồng offline, không gọi LeetCode API (chỉ đọc DOM).

Không nằm trong scope giai đoạn này: auto-sync hàng loạt, crawl, login LeetCode, AI parse.

---

## 2. Bối cảnh & vấn đề

- Hiện tại `problems/` rỗng, seed script đã bỏ. Dữ liệu duy nhất vào hệ thống là `engine.register(...)` thủ công.
- Muốn có đề bài thật từ LeetCode để chạy thử, nhưng LeetCode không có public API ổn định; GraphQL bị rate-limit và đổi schema.
- Giải pháp thực tế: để người dùng đang xem đề bài trên `leetcode.com` tự "clip" DOM → JSON → paste vào app của mình. Tận dụng DOM đã render sẵn, không cần API.

Tham khảo:
- `tham_khao/de_bai.html` — snapshot DOM thực tế của 1 đề (`5. Longest Palindromic Substring`). Kích thước lớn, nhiều rác (ads, discussion, comments).
- `tham_khao/Gemielle` — extension mẫu: `manifest.json` MV3 + `content.js` (widget draggable, speech bubble, MutationObserver) + `style.css` (fixed widget, z-index 999999). Tái sử dụng pattern này nhưng đổi domain + hành vi từ "AI status" sang "clip".

---

## 3. Phân tích tham khảo

### 3.1 DOM đề bài (`de_bai.html`)

Cấu trúc thực tế (rút gọn từ snapshot):

```html
<div class="flexlayout__tab" data-layout-path="/ts0/t0">
  <div class="text-title-large font-semibold">
    <a href="/problems/longest-palindromic-substring/">5. Longest Palindromic Substring</a>
  </div>
  <div class="text-difficulty-medium">Medium</div>  <!-- hoặc text-difficulty-easy/hard -->
  <div class="HTMLContent_html__0OZLp" data-track-load="description_content" data-qd-rendered-description="">
    <p>Given a string <code>s</code>, return <em>the longest</em> palindromic substring ...</p>
    <p><strong class="example">Example 1:</strong></p>
    <pre>Input: s = "babad" ...</pre>
    <p><strong>Constraints:</strong></p>
    <ul><li>1 &lt;= s.length &lt;= 1000</li> ...</ul>
  </div>
</div>
```

Selector ổn định nhất: `[data-track-load="description_content"]` (xuất hiện 1 lần). Fallback: `[data-qd-rendered-description]`, `.HTMLContent_html__*`.

Các field khác:
- **id + slug**: parse từ `a[href^="/problems/"]` → `href="/problems/longest-palindromic-substring/"` + text `"5. Longest Palindromic Substring"` → id=5, title="Longest Palindromic Substring", slug="longest-palindromic-substring".
- **difficulty**: `.text-difficulty-*` hoặc innerText `Easy|Medium|Hard` trong badge `bg-fill-secondary`.
- **tags/topic**: badge `Topics` gần difficulty (optional).
- **description HTML**: chính là `innerHTML` của `[data-track-load="description_content"]`.

Phần cần **loại bỏ**: ads (`group/ads`), `Accepted / Acceptance Rate`, `Similar Questions`, `Discussion`, `Comments`, `premium lock`, SVG rác — tất cả nằm ngoài khối `description_content`, nên chỉ cần cắt đúng khối đó là đã sạch 80%.

### 3.2 Gemielle — pattern tái sử dụng

| Thành phần | Gemielle hiện có | Clipper sẽ kế thừa / đổi |
|---|---|---|
| `manifest.json` MV3 | `content_scripts.matches: gemini/chatgpt/deepseek`, `permissions: clipboardRead` | Đổi sang `*://leetcode.com/problems/*`, thêm `clipboardWrite`, `activeTab` |
| `content.js` | `createWidget()` fixed bottom-right, `makeDraggable()`, `MutationObserver` cho AI typing | Giữ `createWidget` + `makeDraggable` + `keepWidgetInBounds`; bỏ AI state machine, thay bằng `clipProblem()` + `copyToClipboard()` + `toast` |
| `style.css` | `#gemini-ai-widget-container { fixed, z-index 999999 }` | Đổi prefix `#lc-clipper-widget`, giữ draggable/bubble style, thêm nút "Copy" |
| `install.*` | script cài đặt | Không cần cho phase đầu (load unpacked thủ công) |

Bài học: widget phải `pointer-events: auto`, `z-index` cao, `user-select: none`, chặn `dragstart`, clamp trong viewport khi resize.

---

## 4. Kiến trúc tổng thể

```
leetcode.com/problems/<slug>          apps/web (localhost:5173)         apps/server (:3000)
┌─────────────────────────┐           ┌─────────────────────────┐       ┌──────────────────────┐
│ Content Script (clipper)│           │ Paste Zone Component    │       │ POST /api/problems/  │
│  - widget icon (fixed)  │  clipboard│  - textarea / paste     │  HTTP │   /import            │
│  - onClick → extract DOM│ ────────► │  - JSON.parse + validate│ ────► │  → engine.register() │
│  - clean → JSON         │  JSON     │  - preview description  │       │  → problemDb.add()   │
│  - navigator.clipboard  │           │  - Save → toast         │       │  → GET /api/problems │
│    .writeText(json)     │           └─────────────────────────┘       └──────────────────────┘
└─────────────────────────┘                       ▲                               │
                                                 │                               ▼
                                        packages/shared                 packages/database
                                        ProblemClip JSON type           SQLite leetcode.db
```

Dependency:
- `apps/extension` là app độc lập (không thuộc pnpm workspace build), chỉ share type qua copy hoặc `packages/shared` nếu build extension bằng Vite.
- `apps/web` import `ProblemMeta` từ `@leetcode/shared` để validate.
- `apps/server` thêm route import, tái dùng `ProblemDatabase` + `ProblemEngine`.

---

## 5. Thiết kế chi tiết

### 5.1 Browser Extension — `apps/extension` (mới)

**Vị trí đề xuất:** `apps/extension/` (không đăng ký trong `pnpm-workspace.yaml` build pipeline, hoặc đăng ký riêng với `vite build` cho extension).

```
apps/extension/
├── manifest.json          # MV3, matches leetcode.com/problems/*
├── src/
│   ├── content.ts         # widget + extract + clean + copy
│   ├── clipper.ts         # pure logic: parse DOM → ProblemClip JSON (testable)
│   └── style.css          # widget style (fork từ Gemielle)
├── assets/
│   └── icon.png / icon.svg
├── package.json           # dev: vite build, lint
└── README.md              # hướng dẫn load unpacked
```

**manifest.json (dự kiến):**
```json
{
  "manifest_version": 3,
  "name": "LeetCode Clipper",
  "version": "0.1.0",
  "description": "Clip đề bài LeetCode thành JSON vào clipboard để dán vào LeetCode Lab.",
  "permissions": ["clipboardWrite"],
  "host_permissions": ["*://leetcode.com/*"],
  "content_scripts": [{
    "matches": ["*://leetcode.com/problems/*"],
    "css": ["style.css"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }],
  "icons": { "128": "assets/icon.png" }
}
```
Không cần `background.js` ở phase 1.

**Widget UI:**
- Floating button tròn 44x44, icon `LC` hoặc `⎙`, `position: fixed; bottom: 20px; right: 20px; z-index: 999999`.
- Trạng thái: `idle` (màu neutral), `success` (check xanh 2s), `error` (đỏ).
- Click → `clipProblem()` → `navigator.clipboard.writeText(json)` → toast "Đã copy JSON (... chars)".
- Draggable (tái dùng `makeDraggable` của Gemielle, threshold 5px, clamp viewport).
- Không hiện speech bubble phức tạp; chỉ cần toast nhỏ.

**DOM extraction — `clipper.ts` (pure, testable):**

```ts
export interface ProblemClip {
  id: number;                 // parse từ title "5. Title" hoặc fallback slug hash
  slug: string;               // "longest-palindromic-substring"
  title: string;              // "Longest Palindromic Substring"
  difficulty: Difficulty;     // "easy"|"medium"|"hard"
  tags: string[];             // [] phase 1 (optional)
  description: string;        // HTML đã làm sạch (innerHTML của description_content)
  url: string;                // location.href
  clippedAt: string;          // ISO timestamp
}
```

Selectors (theo thứ tự ưu tiên, có fallback):
1. **Description container:** `document.querySelector('[data-track-load="description_content"]')` → fallback `'[data-qd-rendered-description]'` → `'[class*="HTMLContent_html"]'` → `'.question-content'` (legacy).
2. **Title + slug:** `document.querySelector('a[href^="/problems/"]')` trong tab header; parse `href` và `textContent`. Fallback: `document.title` hoặc `location.pathname.split('/')[2]`.
3. **Difficulty:** `document.querySelector('[class*="text-difficulty"]')` hoặc badge chứa text `/Easy|Medium|Hard/i` gần title.
4. **Tags:** phase 1 để rỗng hoặc lấy từ `a[href*="/tag/"]` nếu có.

Nếu không tìm thấy description container → toast lỗi "Chưa tải xong đề bài, hãy đợi trang render".

**Cleaning rules (`cleanDescription`):**
- Clone node → loại bỏ `script`, `style`, `iframe`, `noscript`.
- Xóa attribute `style`, `class` dư thừa? Giữ `class` tối thiểu để render đẹp, hoặc strip hết class và chỉ giữ semantic tags (`p, pre, code, ul, ol, li, strong, em, a`).
- Chuẩn hóa `&nbsp;` → space, trim.
- Giữ `pre` cho Example, giữ `ul/li` cho Constraints.
- Optional: sanitize bằng `DOMPurify` nếu muốn chặt (thêm dependency).
- Serialize: `container.innerHTML` sau khi clean.

**Clipboard:**
- `await navigator.clipboard.writeText(JSON.stringify(clip, null, 2))`. Fallback `document.execCommand('copy')` nếu permission thiếu.
- JSON phải `JSON.parse` được ở web.

### 5.2 Shared — `packages/shared`

Thêm type `ProblemClip` (hoặc `ImportedProblem`) và validator Zod (nếu chưa có zod ở shared thì để ở server/web). Đề xuất:

```ts
// packages/shared/src/index.ts
export interface ProblemClip {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  url?: string;
  clippedAt?: string;
}
export function parseProblemClip(json: string): ProblemClip { /* JSON.parse + validate */ }
```

Hoặc chỉ export type, validation để ở `apps/server` + `apps/web`.

### 5.3 Server — `apps/server/src/index.ts`

Thêm route:

```ts
app.post("/api/problems/import", async (req, reply) => {
  const body = z.object({
    id: z.number().int().positive(),
    slug: z.string().optional(),
    title: z.string().min(1),
    difficulty: z.enum(["easy","medium","hard"]),
    tags: z.array(z.string()).optional().default([]),
    description: z.string().min(1),
    testCases: z.array(z.object({ input: z.unknown(), expected: z.unknown() })).optional().default([]),
    solution: z.string().optional(),
  }).parse(req.body);

  const problem: Problem = {
    id: body.id, title: body.title, difficulty: body.difficulty,
    tags: body.tags, description: body.description,
    testCases: body.testCases, solution: body.solution,
  };
  engine.register(problem); // đã fire-and-forget vào SQLite
  return { ok: true, problem };
});
```

Cân nhắc: `POST /api/problems` (REST) thay vì `/import`. Chọn `/import` để rõ intent clip.

Cũng cần `GET /api/problems` (list) để web hiển thị danh sách sau khi import.

Lưu ý: `engine` là in-memory → mất khi restart. Nhưng `problemDb.add` đã ghi SQLite. Cần bổ sung logic khởi động server load từ DB vào `engine` (hoặc chấp nhận phải re-import sau restart — ghi rõ trong plan).

### 5.4 Web — `apps/web`

Thêm component `ProblemImportPaste`:

```
apps/web/src/
├── components/
│   └── ProblemImportPaste.tsx   # textarea + paste + preview + save
├── lib/
│   └── problemClip.ts           # parse + validate clip JSON
└── App.tsx                      # tích hợp paste zone + problem list
```

UI flow:
1. Vùng paste: `<textarea placeholder="Dán JSON từ extension vào đây..." />` + nút "Paste từ clipboard" (`navigator.clipboard.readText()`).
2. On paste / on button click: `JSON.parse` → validate (`id, title, difficulty, description` required) → preview (render `description` bằng `dangerouslySetInnerHTML` sau khi sanitize).
3. Nút "Lưu vào DB" → `fetch POST /api/problems/import` → toast success → reload problem list.
4. Hiển thị problem vừa lưu bằng `engine.get` hoặc fetch từ server.

Alternative: cho phép `Ctrl+V` toàn trang tự bắt clipboard.

Không cần Monaco ở phase này; chỉ cần hiển thị description + nút Save.

---

## 6. JSON schema (clipboard)

```json
{
  "id": 5,
  "slug": "longest-palindromic-substring",
  "title": "Longest Palindromic Substring",
  "difficulty": "medium",
  "tags": [],
  "description": "<p>Given a string <code>s</code>, return ...</p><p><strong>Example 1:</strong></p><pre>...</pre>...",
  "url": "https://leetcode.com/problems/longest-palindromic-substring/",
  "clippedAt": "2026-08-30T12:34:56.789Z"
}
```

Tương thích với `ProblemMeta` hiện có: `id, title, difficulty, tags, description, testCases?, solution?`. Extension chỉ điền `id/title/difficulty/tags/description`; `testCases` để rỗng phase 1 (có thể parse từ Example sau này).

---

## 7. Luồng chi tiết (sequence)

```
1. User mở https://leetcode.com/problems/longest-palindromic-substring/
2. Extension content script inject (document_idle) → tạo widget icon
3. User click icon
4. content.js: findDescriptionContainer() → nếu null → toast lỗi
5. extractTitleAndSlug() + extractDifficulty() + cleanDescription()
6. build ProblemClip JSON → navigator.clipboard.writeText()
7. toast "Đã copy 5. Longest Palindromic Substring (1234 chars)"
8. User chuyển tab về localhost:5173
9. Paste vào textarea (hoặc bấm "Paste từ clipboard")
10. Web validate → preview → bấm "Lưu"
11. POST /api/problems/import → server engine.register + SQLite
12. Web fetch lại danh sách → hiển thị đề bài mới
```

---

## 8. File thay đổi (dự kiến)

```
Mới:
  apps/extension/manifest.json
  apps/extension/src/content.ts
  apps/extension/src/clipper.ts
  apps/extension/src/style.css
  apps/extension/assets/icon.svg
  apps/extension/package.json
  apps/extension/tsconfig.json
  apps/extension/README.md
  apps/web/src/components/ProblemImportPaste.tsx
  apps/web/src/lib/problemClip.ts

Sửa:
  packages/shared/src/index.ts          # thêm ProblemClip type
  apps/server/src/index.ts              # thêm POST /api/problems/import + GET /api/problems
  apps/web/src/App.tsx                  # tích hợp paste zone + problem list
  AI/STATUS.md                          # cập nhật phase
  AI/ARCHITECTURE.md                    # thêm extension vào diagram
  AI/index/PROJECT_STRUCTURE.md         # thêm apps/extension
  AI/context/decisions.md               # ghi quyết định chọn DOM clip thay vì API
```

Không sửa: `packages/database` schema (chưa cần thêm cột `slug`/`url` phase 1; có thể thêm sau nếu cần).

---

## 9. Xử lý edge cases & rủi ro

| Rủi ro | Mitigation |
|---|---|
| LeetCode đổi DOM (class/data attribute) | Dùng nhiều fallback selector; log warning khi fallback; dễ update selector tập trung trong `clipper.ts` |
| Trang chưa render xong (SPA) | Đợi `document_idle` + check `description_content` tồn tại; nếu null thì retry 1s hoặc báo lỗi "đợi tải" |
| Clipboard permission bị chặn | Fallback `execCommand('copy')` + hướng dẫn copy thủ công (hiện JSON trong modal) |
| ID trùng (đã có problem) | Server `onConflictDoNothing` — trả về 409 hoặc 200 với flag `alreadyExists` |
| `engine` mất sau restart | Ghi vào SQLite; khi server khởi động, load all từ `problemDb.getAll()` vào `engine` (cần thêm init) |
| XSS từ description HTML | Sanitize trước khi `dangerouslySetInnerHTML` (DOMPurify hoặc strip script) |
| Monorepo build ảnh hưởng extension | Extension build riêng (vite/zip), không tham gia `pnpm -r build` |

---

## 10. Testing

- **Unit (Vitest) cho `clipper.ts`:** đặt `apps/extension/src/clipper.test.ts` cạnh logic.
  - Test `parseTitle("5. Longest Palindromic Substring") → {id:5, title:"Longest..."}`
  - Test `extractSlug` từ href
  - Test `cleanDescription` với HTML mẫu từ `de_bai.html` (dùng `jsdom`)
  - Test `buildProblemClip` với DOM mock
  - Tham khảo template `AI/skills/vitest-logic-testing/test-template.test.ts`
- **Manual:**
  - Load unpacked extension trên Chrome → mở leetcode problem → click icon → check clipboard JSON
  - Paste vào `localhost:5173` → preview → Save → check DB `leetcode.db` và `GET /api/problems/:id`
- Không cần e2e Playwright ở phase 1.

---

## 11. Roadmap implementation (sau planning)

1. **Scaffold extension** — tạo `apps/extension/`, manifest, style, content skeleton, build script.
2. **Implement clipper.ts** — extraction + cleaning + JSON builder (có test).
3. **Implement widget UI** — icon, draggable, click handler, clipboard, toast.
4. **Shared type** — thêm `ProblemClip` vào `packages/shared`.
5. **Server import API** — `POST /api/problems/import` + `GET /api/problems`.
6. **Web paste zone** — component + preview + save flow.
7. **Integration test thủ công** — clip thật từ leetcode.com → paste → lưu → hiển thị.
8. **Docs** — cập nhật `AI/ARCHITECTURE.md`, `AI/index/*`, `AI/history/`, `AI/STATUS.md` (done).
9. **Move plan to completed** — chạy `AI\skills\feature-development\move-plan-to-completed.bat leetcode-clipper-extension`.

---

## 12. Tiêu chí hoàn thành (Definition of Done)

- [ ] Extension hiện icon chỉ trên `leetcode.com/problems/*`, draggable, click copy JSON hợp lệ.
- [ ] JSON paste vào web hiển thị đúng title/difficulty/description (không lẫn ads/comments).
- [ ] Lưu thành công vào DB và `GET /api/problems/:id` trả về problem vừa clip.
- [ ] Có unit test cho `clipper.ts` (Vitest) pass.
- [ ] Docs (`ARCHITECTURE.md`, `PROJECT_STRUCTURE.md`, `decisions.md`, `STATUS.md`) đã cập nhật.
- [ ] Plan được move sang `AI/plans/completed/`.

---

## 13. Ghi chú

- `tham_khao/` là untracked, không commit. DOM mẫu và Gemielle chỉ dùng để tham khảo khi implement.
- Không sinh code trong phase planning — chỉ tạo plan + branch + STATUS.
- Source of truth là source code; nếu tài liệu mâu thuẫn thì cập nhật tài liệu.
