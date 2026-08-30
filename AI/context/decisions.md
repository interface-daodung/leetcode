# Technical Decisions

> Lưu các quyết định kỹ thuật quan trọng và lý do của chúng.

## Decisions

### [2026-08-30] Dùng AGENT.md làm instruction entry cho opencode

#### Context

Agent cần đọc AGENT.md (và qua đó AI/INDEX.md, STATUS.md, CONVENTIONS.md) ngay khi bắt đầu làm việc, tránh đọc lan man nhiều file trong repository.

#### Decision

Khai báo `"instructions": ["AGENT.md"]` trong OpenCode config để AGENT.md được nạp vào context của Agent.

#### Reason

Agent có nguyên tắc làm việc ngay từ đầu mà không cần tự khám phá.

#### Consequences

- Mọi thay đổi về quy tắc làm việc phải đi qua AGENT.md.

### [2026-08-30] Gộp Plan Management vào skill feature-development

#### Context

Thư mục `AI/skills/plan-management/` trùng chức năng với `feature-development`, gây phân mảnh skill. Script `move-plan-to-completed.bat` đã nằm trong `feature-development/`.

#### Decision

- Xoá `AI/skills/plan-management/`.
- Quy trình plan (tạo/edit/hoàn thành) nhập vào `AI/skills/feature-development/SKILL.md` (mục Plan Management).
- Mọi tham chiếu (AGENTS.md) trỏ về `feature-development`.

### [2026-08-30] LeetCode Clipper — chọn DOM clip thay vì LeetCode API

#### Context

Cần đưa đề bài thật từ LeetCode vào hệ thống nội bộ. LeetCode GraphQL API không ổn định, bị rate-limit và đổi schema; `problems/` rỗng, seed script đã bỏ.

#### Decision

- Tạo browser extension MV3 (`apps/extension`) đọc DOM đã render trên `leetcode.com/problems/*` thay vì gọi API.
- Selector chính: `[data-track-load="description_content"]` (fallback `data-qd-rendered-description`, `HTMLContent_html__*`), parse id/slug từ `a[href^="/problems/"]`, difficulty từ `text-difficulty-*`.
- Extension copy `ProblemClip` JSON vào clipboard; web `ProblemImportPaste` paste → preview (sanitize) → `POST /api/problems/import` → `engine.register` + `problemDb.add`.
- Server hydrate `engine` từ SQLite khi khởi động để không mất dữ liệu sau restart; thêm `GET /api/problems` và CORS.
- `ProblemClip` type được thêm vào `packages/shared` để đồng bộ giữa web/server/extension (extension copy type, không phụ thuộc workspace build).

#### Reason

- Tận dụng DOM đã render sẵn, không phụ thuộc API hay auth LeetCode.
- Luồng offline, đơn giản, dễ bảo trì (chỉ cần cập nhật selector khi LeetCode đổi DOM).
- Tái sử dụng pattern widget draggable của Gemielle (`style.css`, `makeDraggable`).

#### Consequences

- Cần cập nhật selector khi LeetCode đổi class/data attribute.
- Extension phải load unpacked thủ công (chưa publish store).
- Dữ liệu clip chỉ có `description` HTML; `testCases` để rỗng phase 1, có thể parse từ Example sau này.

### [2026-08-30] LeetCode Clipper — direct import + env host + assets dedupe

#### Context

Host `http://localhost:3000` bị hard-code rải rác ở server/web/extension; extension chỉ copy clipboard nên phải paste thủ công ở web; description có `<img>` cần lưu local để offline và tránh hotlink, đồng thời tránh lưu trùng cùng ảnh.

#### Decision

- Tập trung host vào root `.env` (PORT/HOST/API_URL/VITE_API_URL/EXTENSION_API_URL); server đọc via `dotenv` (path từ `import.meta.url`), web đọc via Vite `envDir=root` + `import.meta.env.VITE_API_URL`, extension đọc via `api-config.js` auto-gen từ `scripts/sync-api-url.mjs` (prebuild).
- Extension widget sau khi `buildProblemClip` sẽ validate chặt (`id>0`, `title`/`description` non-empty, `difficulty`, `tags` array) rồi **fetch POST trực tiếp** tới `${API_BASE}/api/problems/import` (JSON body) song song với copy clipboard; hiển thị toast 201/409/error, `host_permissions` thêm `localhost` + origin của `API_URL` (sync script cập nhật manifest).
- Server `POST /api/problems/import` thêm validation Zod strict (null check, trim, refine), gọi `downloadAndRewriteImages(description, slug, API_URL)` trước khi `engine.register`:
  - Extract `<img src>` via regex, với mỗi src (bỏ qua `data:` và `/assets/`): `fetch` → `Buffer` (timeout 15s) → `SHA-256` → check `.hash-index.json` (hash → relativePath) → nếu trùng thì reuse path cũ (HTTP Response → Buffer → SHA-256 → kiểm tra đã tồn tại chưa → nếu mới thì ghi), nếu mới thì `sanitizeFilename` + `writeFile` vào `packages/database/data/assets/<slug>/{name}` (nếu trùng tên nhưng khác hash thì thêm `-${hash.slice(0,8)}`) → rewrite `description` src thành `${API_URL}/assets/${relativePath}`.
  - Serve ảnh qua `@fastify/static` tại `GET /assets/*` (root `ASSETS_ROOT`).
- Web `App.tsx`/`ProblemImportPaste.tsx` dùng `VITE_API_URL` từ root `.env` (fallback localhost) cho `GET /api/problems` và `POST /import`, list hiển thị ngay sau import.

#### Reason

- Một chỗ sửa host (`.env`) áp dụng cho toàn monorepo, tránh lệch port khi đổi môi trường.
- Direct POST bỏ bước paste thủ công, giảm thao tác, vẫn giữ clipboard fallback khi server chưa chạy.
- Lưu ảnh local giúp offline, tránh CORS/hotlink, dedupe SHA-256 tránh lãng phí disk khi cùng ảnh xuất hiện ở nhiều problem; `Buffer → SHA-256 → check` đủ nhanh cho ảnh nhỏ.

#### Consequences

- Cần chạy `pnpm --filter=@leetcode/extension sync:config` (hoặc `pnpm -r build`) sau khi sửa root `.env` để extension cập nhật `api-config.js` và `manifest host_permissions`.
- `packages/database/data/assets/` và `.hash-index.json` bị `.gitignore`, không commit; cần backup nếu cần migrate.
- Server phụ thuộc `dotenv`, `@fastify/static`; cần `pnpm install`.
- Nếu `fetch` ảnh fail (404/timeout) thì giữ nguyên src gốc, không fail cả import (đã có test).

### [2026-08-30] LeetCode Clipper — DB migration: bỏ .hash-index.json, thêm hints/template/url và problem_assets

#### Context

`.hash-index.json` lưu hash → path ngoài DB, khó quản lý per-problem, không có FK, không query được; `problems` còn `solution` nhưng cần `template` (code khởi tạo) và `url` (link gốc) để lưu trong JSON; cần lưu hints của LeetCode (mỗi problem có 1..3+ hints, mẫu HTML với lightbulb + `HTMLContent_html__0OZLp`).

#### Decision

- Xóa `packages/database/data/assets/.hash-index.json`, tạo migration `0001_add_url_template_hints_assets`:
  - `problems`: thêm `slug` text, `url` text, `template` text, bỏ `solution` (`DROP COLUMN`), giữ `tags`/`description`/`testCases`.
  - Tạo `problem_assets` (id PK autoincrement, problem_id FK→problems.id cascade, original_url, local_path, hash + index hash/problem) để lưu per-problem ảnh (originalUrl → localPath + hash dedupe toàn cục).
  - Tạo `hints` (id PK, problem_id FK cascade, ord, content) để lưu hints theo thứ tự.
  - Sửa `0000_init.sql` dùng `text` thay `NVARCHAR(MAX)`/`DATETIME` để fix `SQLITE_ERROR near "MAX"` trên libsql khi tạo DB mới.
- `packages/shared`: `ProblemMeta`/`ProblemClip` thêm `slug?`/`url?`/`template?`/`hints?`, bỏ `solution`.
- `packages/database`: `ProblemDatabase` thêm `getAllWithHints`, `getHints/setHints`, `addAsset/findAssetByHash/findAssetsByProblem`, `updateDescription/update`, `ProblemMeta` mapping.
- `apps/server`: `src/assets.ts` viết lại dùng DB (`findAssetByHash` → reuse `localPath` → `addAsset` per-problem, không dùng file JSON), thêm `problemId` param, check `access` file tồn tại; `src/index.ts` đổi import flow (tạo problem trước để FK hợp lệ → `downloadAndRewriteImages` với `problemId` → `updateDescription` + cập nhật engine), thêm `GET /:id/hints`/`/assets`, hydrate `getAllWithHints`, `GET /:id` trả `hints`+`assets`.
- `apps/extension`: `src/clipper.ts` thêm `extractHints` (quét `div.flex.flex-col` có `Hint N` + `overflow-hidden`/`HTMLContent`) và `extractTemplate` (monaco `.view-line` join, fallback `CodeMirror`/`.monaco-editor`), `buildProblemClip` trả `url`/`template`/`hints`, `isValidProblemClip` check thêm, `content.js` đồng bộ, thêm 7 tests → 42 tests.
- `apps/web`: `lib/problemClip.ts` parse thêm `template`/`hints`/`url`, `ProblemImportPaste.tsx` hiển thị `url` link, `template` pre, `hints` list (sanitize).

#### Reason

- Đưa assets/hints vào DB giúp query per-problem, FK cascade khi xóa problem, dedupe toàn cục qua `hash` index, không còn file JSON rời rạc.
- `template` thay `solution` vì clip lấy code khởi tạo từ LeetCode, không phải lời giải; `url` để lưu link gốc trong JSON.
- Hints parse từ DOM thực tế (lightbulb) cho AI/học tập, số lượng biến động.

#### Consequences

- Cần xóa DB cũ hoặc chạy migration `0001` để có schema mới (đã test fresh DB tạo mới ok, hydrated 3 problems); nếu DB cũ còn `.hash-index.json` thì xóa file (đã `.gitignore`).
- Import phải tạo `problems` trước rồi mới `addAsset` (FK), nên `src/index.ts` đã đổi thứ tự và thêm `updateDescription`.
- `pnpm -r build` pass, `extension` 42 tests + `server` 5 tests (mock DB) pass; end-to-end với `https://httpbin.org/image/png` verify dedupe reuse cùng `localPath` giữa 2 problem.
