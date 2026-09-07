# LeetCode Clipper — Direct Import + Env Host + Assets Download (mở rộng)

Ngày: 2026-08-30
Nhánh: `feat/leetcode-clipper-extension` (tiếp tục trên cùng nhánh sau khi base đã move plan)

## Mục tiêu

- Extension bấm widget sẽ **gọi trực tiếp server localhost** (host lưu ở root `.env` để dễ sửa cho toàn bộ apps), truyền JSON ở body, server kiểm tra các trường khác null và cấu trúc hợp lệ thì lưu vào DB và hiển thị list đọc từ DB lên web frontend.
- Nếu `description` có `<img>` thì tải ảnh về `packages/database/data/assets/<slug>/{name}` (name là tên gốc trong URL), tránh trùng bằng hash SHA-256 của Buffer (HTTP Response → Buffer → SHA-256 → kiểm tra đã tồn tại chưa → nếu mới thì ghi file).

## Bối cảnh

- Base clipper đã có: DOM clip → clipboard → web paste → POST. User yêu cầu bỏ bước paste thủ công, extension gọi thẳng API.
- Host cứng `http://localhost:3000` rải rác ở `apps/server/src/index.ts`, `apps/web/src/App.tsx`, `apps/web/src/components/ProblemImportPaste.tsx`, `apps/extension/content.js` — cần tập trung vào `.env` root.
- LeetCode description có ảnh (ví dụ `<img src="https://...">`), cần lưu local để offline và tránh hotlink, đồng thời dedupe trùng nội dung.

## Thay đổi

### 1. Env tập trung

- Tạo root `.env.example` và `.env` (PORT=3000, HOST=0.0.0.0, API_URL=http://localhost:3000, VITE_API_URL=..., EXTENSION_API_URL=...), `.gitignore` thêm `.env`, `assets/`, `tham_khao/`.
- Server: `apps/server/src/index.ts` dùng `dotenv` với `fileURLToPath(new URL("../../../.env", import.meta.url))`, đọc `PORT`/`HOST`/`API_URL` (fallback `VITE_API_URL`), log `Assets served from ... at ${API_URL}/assets/`.
- Web: `apps/web/vite.config.ts` thêm `envDir: path.resolve(__dirname, "../../")` để Vite đọc root `.env`; `App.tsx` và `ProblemImportPaste.tsx` đổi `const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000"`.
- Extension: `apps/extension/api-config.js` (var LC_API_BASE) auto-gen từ root `.env` qua `scripts/sync-api-url.mjs` (đọc EXTENSION_API_URL||API_URL||VITE_API_URL, viết `api-config.js`, cập nhật `manifest.json host_permissions`), `package.json` thêm `sync:config` và `prebuild` (prebuild tự chạy khi `pnpm build`), `manifest.json` thêm `api-config.js` trước `content.js` và host_permissions `http://localhost/*`, `http://127.0.0.1/*`.

### 2. Server — validation chặt + tải ảnh + serve static

- Thêm dep `dotenv`, `@fastify/static` vào `apps/server/package.json`, `pnpm install`.
- Tạo `apps/server/src/assets.ts`:
  - `ASSETS_ROOT = fileURLToPath(new URL("../../../packages/database/data/assets", import.meta.url))`, `HASH_INDEX_PATH = join(ASSETS_ROOT, ".hash-index.json")`.
  - `sanitizeSlug`, `sanitizeFilename` (lấy basename từ URL, decode, thêm ext từ content-type nếu thiếu, sanitize, giới hạn 120 chars), `extractImgSrcs` (regex `<img[^>]+src="..."`), `downloadAndRewriteImages(description, slug, apiBase)`:
    - `srcs = extractImgSrcs(description)` dedupe, nếu rỗng return gốc.
    - `ensureDir(slugDir)` (sanitize slug).
    - `loadHashIndex()` từ `.hash-index.json` (hash → relativePath).
    - Với mỗi `originalSrc` (bỏ qua `data:` và `/assets/`):
      - `fetch(originalSrc)` timeout 15s, `res.arrayBuffer()` → `Buffer`, lấy `content-type`.
      - `hash = createHash("sha256").update(buffer).digest("hex")`.
      - Nếu `hashIndex[hash]` tồn tại và file còn tồn tại → reuse `relativePath`, rewrite `newDescription = newDescription.split(originalSrc).join(`${apiBase}/assets/${relativePath}`)` (dedupe).
      - Nếu chưa tồn tại: `filename = sanitizeFilename(originalSrc, contentType)`, `targetPath = join(slugDir, filename)`, nếu file cùng tên đã tồn tại nhưng hash khác thì thêm `-${hash.slice(0,8)}`, `await writeFile(targetPath, buffer)`, `relativePath = `${safeSlug}/${finalFilename}``, cập nhật `hashIndex[hash]=relativePath`.
    - Sau loop, nếu `indexDirty` thì `saveHashIndex`.
    - Return `newDescription` với src đã rewrite.
  - `apps/server/src/index.ts`:
    - Import `fastifyStatic`, `ASSETS_ROOT`, `downloadAndRewriteImages`; `await app.register(fastifyStatic, { root: ASSETS_ROOT, prefix: "/assets/", wildcard:false })`.
    - `POST /api/problems/import` đổi schema sang `z.object({...}).strict()` với `transform` trim, `refine` không rỗng, `tags` transform, `url`/`clippedAt` optional nullable, `testCases` nullable default; sau validate, `rawSlug = parsed.slug || 'problem-${id}'`, `processedDescription = await downloadAndRewriteImages(parsed.description, rawSlug, API_URL)` (try/catch giữ nguyên nếu fail), tạo `problem` với `description: processedDescription`.
- Thêm `apps/server/src/assets.test.ts` 5 tests (vitest, mock fetch): không có img giữ nguyên, tải + SHA-256 + lưu + rewrite, dedupe cùng buffer khác URL reuse, fetch fail giữ nguyên, bỏ qua data: URL.

### 3. Extension — gọi trực tiếp API

- `apps/extension/content.js`:
  - Thêm `const API_BASE = typeof LC_API_BASE !== "undefined" ? LC_API_BASE : "http://localhost:3000"` (đồng bộ với `api-config.js`).
  - Thêm `isValidClipForPost(clip)` (check id>0, title/description non-empty, difficulty, tags array).
  - Thêm `async postToServer(clip)` (fetch POST `${API_BASE}/api/problems/import` với JSON, xử lý 201/409/4xx, catch network).
  - Sửa `handleClip()`: sau `buildProblemClip`, `copyToClipboard(json)` giữ lại, validate, `showToast("Đang gửi ... tới ${API_BASE}...")`, gọi `postToServer(clip).then(...)` hiển thị `Đã lưu` (success, widget ✓) hoặc `Đã tồn tại` (409) hoặc `Lỗi gửi server`.

### 4. Web — đồng bộ env và hiển thị list từ DB

- Đã có `GET /api/problems` trả từ `problemDb.getAll()` (hydrate), `App.tsx` fetch `${API_BASE}/api/problems` và render list `Đã lưu ({n})` ngay sau `onImported`.

## Kết quả

- `pnpm -r build` pass (9 projects, extension prebuild sync api-config).
- `pnpm --filter=@leetcode/extension test` 35 passed, `pnpm --filter=@leetcode/server test` 5 passed (assets).
- Test thủ công local (với `pnpm --filter=@leetcode/server exec tsx src/index.ts`):
  - `POST {"id":9998, "description":"<p><img src='https://httpbin.org/image/png'>"} → 201, description rewrite thành `http://localhost:3000/assets/test-img2/png.png`, file `packages/database/data/assets/test-img2/png.png` (8090 bytes), `.hash-index.json` có hash.
  - `POST {"id":9997, same image}` → dedupe, rewrite về `test-img2/png.png`, không tạo file mới ở `test-img3` (chỉ folder rỗng), hash-index vẫn 1 entry.
  - `POST duplicate id 9998` → 409.
  - `GET /api/problems` trả 4 items (3 seed + imported), `GET /api/problems/9998` trả description đã rewrite, `GET /assets/test-img2/png.png` serve ảnh (via fastifyStatic).

## Lệnh tham chiếu

```bash
# Sync host sau khi sửa root .env
pnpm --filter=@leetcode/extension sync:config
# hoặc pnpm -r build (prebuild tự sync)

# Server (đọc PORT/HOST/API_URL từ root .env, serve assets)
pnpm --filter=@leetcode/server dev   # tsx watch, http://localhost:3000
pnpm --filter=@leetcode/server build

# Web (VITE_API_URL từ root .env)
pnpm --filter=@leetcode/web dev      # http://localhost:5173

# Extension: chrome://extensions -> Load unpacked -> apps/extension (sau sync)
```

## Ghi chú

- `.env` là single source cho host; đổi `API_URL`/`VITE_API_URL`/`EXTENSION_API_URL` ở root rồi chạy `sync:config` hoặc `build` để extension cập nhật.
- `packages/database/data/assets/` và `.hash-index.json` bị `.gitignore`, không commit; folder tạo động khi import có ảnh.
- `tham_khao/` cũng được `.gitignore` (chỉ để dev tham khảo DOM).
- Ảnh download dùng native `fetch` (Node 18+), timeout 15s, content-type để suy ra extension nếu URL không có tên; nếu fetch fail thì giữ nguyên src gốc, không fail cả import.
- Dedupe là global (hash → relativePath), reuse ngay cả khi slug khác; nếu muốn per-slug dedupe thì đổi key thành `${slug}/${hash}`.
- Cần `pnpm install` sau khi thêm `dotenv`, `@fastify/static`.
