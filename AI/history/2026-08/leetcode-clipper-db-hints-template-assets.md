# LeetCode Clipper — DB migration: hints/template/url + problem_assets DB (bỏ .hash-index.json)

Ngày: 2026-08-30 (tiếp tục nhánh `feat/leetcode-clipper-extension`)
Nhánh: `feat/leetcode-clipper-extension` (đã có base + direct import trước đó)

## Mục tiêu

- Bỏ `packages/database/data/assets/.hash-index.json` (hash → path JSON ngoài DB), chuyển sang lưu trong DB để quản lý per-problem, hỗ trợ FK cascade và query.
- Sửa entity `problems`: thêm `slug`/`url`/`template`, bỏ `solution` (template là code khởi tạo từ LeetCode, không phải lời giải), lưu `url` từ JSON clip.
- Thêm `hints` để lưu 1..n hints mỗi problem (thường 1-3, có thể nhiều hơn), mẫu DOM LeetCode với lightbulb `Hint 1` + `HTMLContent_html__0OZLp`/`overflow-hidden`.

## Thay đổi

### 1. Database — schema + migration

- `packages/database/src/schema.ts`: `problems` thêm `slug` text, `url` text, `template` text, bỏ `solution`; tạo `problem_assets` (id PK autoincrement, problem_id FK→problems.id cascade, original_url, local_path, hash + index hash/problem) và `hints` (id PK, problem_id FK cascade, ord, content).
- Tạo `drizzle/0001_add_url_template_hints_assets.sql` (ADD COLUMN slug/url/template, DROP COLUMN solution, CREATE TABLE problem_assets + indexes, CREATE TABLE hints + index) + `meta/0001_snapshot.json` + cập nhật `meta/_journal.json` idx 1.
- Sửa `drizzle/0000_init.sql` dùng `text` thay `NVARCHAR(MAX)`/`DATETIME` để fix `SQLITE_ERROR near "MAX"` khi tạo DB mới với libsql (fresh DB đã test ok).
- Xóa `packages/database/data/assets/.hash-index.json` (đã `.gitignore` assets, chuyển sang DB).

### 2. Shared + DB layer

- `packages/shared/src/index.ts`: `ProblemMeta`/`ProblemClip` thêm `slug?`/`url?`/`template?`/`hints?[]`, bỏ `solution`.
- `packages/database/src/index.ts`: `ProblemDatabase.add` lưu `slug`/`url`/`template` + `hints` (delete+insert), `get`/`getAllWithHints` load hints, `getHints/setHints`, `addAsset/findAssetByHash/findAssetsByProblem`, `updateDescription/update`.

### 3. Server — assets DB + import flow

- `apps/server/src/assets.ts`: viết lại `downloadAndRewriteImages(description, slug, apiBase, problemId)` dùng DB (`findAssetByHash` → nếu tồn tại và file còn thì reuse `localPath`, `findAssetsByProblem` check per-problem rồi `addAsset`, nếu chưa tồn tại thì `writeFile` + `addAsset`), không dùng file JSON.
- `apps/server/src/index.ts`: hydrate `getAllWithHints`, `GET /:id` trả `hints`+`assets` (fallback DB), thêm `GET /:id/hints` + `GET /:id/assets`, `POST /import` validate thêm `url`/`template`/`hints` (Zod, trim, strict), đổi thứ tự: tạo `problem` với description gốc → `engine.register` + `problemDb.add` (để FK hợp lệ) → `downloadAndRewriteImages` với `problemId` → nếu rewrite khác thì `updateDescription` + cập nhật engine.

### 4. Extension — hints + template

- `apps/extension/src/clipper.ts`: thêm `extractHints(doc)` (quét `div.flex.flex-col` có `div.text-body` =~ `Hint \d+` → lấy `div.overflow-hidden > div`/`HTMLContent`/`mt-2`, clone loại bỏ script/svg/button, lấy innerHTML) và `extractTemplate(doc)` (monaco `.view-line` join, fallback `.monaco-editor` text, `CodeMirror`/`.cm-content`, `pre` chứa function), `buildProblemClip` trả `url`/`template`/`hints`, `isValidProblemClip` check thêm `url`/`template`/`hints`.
- `apps/extension/content.js`: đồng bộ `extractHints`/`extractTemplate` + `buildProblemClip`, `isValidClipForPost` giữ nguyên (check cơ bản).
- Tests: thêm `extractHints` (1 hint mẫu lightbulb, 3 hints, empty), `extractTemplate` (monaco, empty), `buildProblemClip với hints/template/url`, `isValidProblemClip với hints/template/url` → 42 tests (trước 35).

### 5. Web

- `apps/web/src/lib/problemClip.ts`: parse thêm `template`/`hints`/`url`.
- `apps/web/src/components/ProblemImportPaste.tsx`: preview thêm `url` link, `template` (pre), `hints` list (sanitize HTML).

## Kết quả

- `pnpm -r build` pass (9 projects), `pnpm --filter=@leetcode/extension test` 42 passed, `pnpm --filter=@leetcode/server test` 5 passed (mock DB với Map).
- Fresh DB tạo mới ok (đã fix `0000` `NVARCHAR(MAX)` → `text`, `migrate()` tạo `problems` + `problem_assets` + `hints`, hydrated 3 problems).
- End-to-end (server chạy http://localhost:3000):
  - `POST 9999` `{id:9999, slug:"test-new-features", url:"https://leetcode.com/problems/test-new-features/", template:"function testNewFeatures...", hints:["Hint 1...","Hint 2...","Hint 3..."], description:"<img src=https://httpbin.org/image/png>"}` → `201` với `assets: [{localPath:"test-new-features/png.png", hash:"541a...", originalUrl:"https://httpbin.org/image/png"}]`, `hints` 3, `template` lưu, description rewrite `http://localhost:3000/assets/test-new-features/png.png`.
  - `GET /9999` trả `hints`+`assets`+`template`+`url`, `GET /9999/hints` 3 items, `GET /9999/assets` 1 item.
  - `POST 9998` cùng ảnh `https://httpbin.org/image/png` → `201` reuse `localPath` `test-new-features/png.png` (không tạo file mới ở `test-dedupe`, cùng hash `541a...`), `GET /9998/assets` cùng `localPath`.
  - `GET /api/problems` list 5 với hints.
- Dọn test data 9999/9998 + assets folder, build/tests lại pass, `assets/.hash-index.json` đã xóa.

## Lệnh tham chiếu

```bash
# DB fresh (xóa file cũ rồi chạy server sẽ auto-migrate)
# pnpm --filter=@leetcode/server dev

# Test
pnpm --filter=@leetcode/extension test # 42
pnpm --filter=@leetcode/server test    # 5
pnpm -r build
```

## Ghi chú

- FK `problem_assets.problem_id` và `hints.problem_id` cascade khi xóa problem.
- Import phải tạo problem trước rồi mới addAsset (FK), nên server đã đổi thứ tự.
- Dữ liệu cũ có `.hash-index.json` sẽ không dùng nữa, xóa file.
