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
