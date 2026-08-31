# Technical Decisions

> Lưu các quyết định kỹ thuật quan trọng và lý do của chúng.

## Decisions

### [2026-08-31] Mở khóa AI tự chủ thao tác git (chỉ cục bộ)

#### Context

Trước đây `AGENTS.md` quy định AI "Không tự commit/merge/push trừ khi được yêu cầu", khiến AI phải dừng lại xin phép sau mỗi phần việc, làm gián đoạn tiến độ liên tục.

#### Decision

- AI được phép **tự chủ thao tác git cục bộ**:
  - **Commit thường xuyên**: sau mỗi phần việc hoàn chỉnh (implement xong, fix xong, docs cập nhật), commit ngay với message rõ ràng, đúng convention (`feat(x):`, `fix(x):`, `refactor(x):`, `docs(x):`).
  - **Tự tạo nhánh**: khi bắt đầu tính năng mới hoặc triển khai kế hoạch, tự tạo nhánh `feat/<name>` / `fix/<name>` rồi làm việc trên nhánh đó.
  - **Merge nội bộ**: được phép merge giữa các nhánh cục bộ (vd gộp `fix/*` về `feat/*`) khi hợp lý.
- **KHÔNG được public lên**: tuyệt đối không `push` lên remote, không `publish`, không tạo PR/release. Remote chỉ phục vụ đồng bộ cá nhân khi user tự chủ động.
- Khi commit: chỉ stage đúng file thuộc phạm vi task (kiểm tra `git status`/`git diff` trước), không commit secret/key/.env, không xóa file ngoài phạm vi.

#### Reason

- Giữ tiến độ liên tục, mỗi phần việc là một commit riêng dễ review/rollback, không bị gián đoạn bởi việc xin phép thủ công.
- Repository là learning lab cá nhân của tác giả (không phải product công khai), nên quản lý git cục bộ là đủ.

#### Consequences

- Cập nhật `AGENTS.md`, `AI/CONVENTIONS.md` (thêm mục Git Workflow), `AI/skills/feature-development/SKILL.md` (thêm bước tạo nhánh + commit).
- AI vẫn tuyệt đối không push/publish/PR.

### [2026-08-31] Widget ảnh động + Toast SVG động + Backend ghi đè problem

#### Context

Widget "LC" chỉ là text + màu nền, ít sinh động, không phản ánh trạng thái. Toast cố định font 60.5px, không co giãn khi text dài/ngắn. Khi problem ID đã tồn tại, server trả 409 chặn — user phải xóa thủ công trong DB mới clip lại được.

#### Decision

- **Widget 4 trạng thái ảnh PNG** (`Idle/Loading/Success/Error.png`) thay text "LC", load qua `chrome.runtime.getURL("assets/...")` (yêu cầu thêm `web_accessible_resources` trong manifest). Thêm hàm `setWidgetState(widget, state)` đổi `img.src` + class.
- **Hiệu ứng Squash & Stretch** 1.2s khi click: `@keyframes squashStretch` theo thứ tự `0% scale(1,1) → 20% (0.75,1.25) → 40% (1.25,0.75) → 55% (0.9,1.1) → 70% (1.05,0.95) → 85% (0.98,1.02) → 100% (1,1)` — dùng `classList.add("squash-stretch")` rồi `setTimeout` 1200ms gỡ.
- **Toast SVG động** port logic từ `sua_svg.js` (Node) sang JS browser: fetch `toast-text.svg` → parse `<g transform="matrix(...)">` lấy translate → tìm `<path d="...">` bbox (robust extreme bỏ mỏ neo lặp 1 lần) → tính font-size tối ưu 24-72px (giảm nếu vượt width, wrap nếu vượt height) → build `<tspan>` escape XML → thay thẻ `<text>` cũ. Position toast ở góc trên-phải widget: `bottom = innerHeight - widgetRect.top + 8`, `right = innerWidth - widgetRect.right`. Lệch text trái `-fontSize*0.15`, lên `-fontSize*0.10`.
- **Backend ghi đè**: thêm `PUT /api/problems/:id` route + `updateClip()` service method (gọi `db.update(id, patch)` thay `db.add`). Validate `body.id === url.id` → 400. CORS thêm `PUT` vào `Access-Control-Allow-Methods` (cả `onSend` hook và OPTIONS handler).
- **Extension tự retry overwrite**: `postToServer()` POST /import trước, nếu 409 → PUT /:id với cùng body, return `{ ok: true, overwritten: true }`. `handleClip()` bỏ branch `result.dup` (error), toast hiển thị "Đã lưu" (mới) hoặc "Đã ghi đè" (overwrite) tùy `result.overwritten`.

#### Reason

- Ảnh PNG cho cảm giác "sống", dễ nhận biết trạng thái; Squash & Stretch là nguyên tắc animation kinh điển của Disney (squash khi chạm đất, stretch khi bay → khối lượng đàn hồi).
- Toast SVG dùng chung 1 khung thoại, chỉ thay text → tận dụng asset có sẵn, auto-scale không cần nhiều biến thể.
- Ghi đè qua PUT thay vì xóa-thêm: idempotent, không mất `assets` cũ nếu description không đổi, an toàn hơn khi clip lại đề đã có.
- CORS PUT: thêm method vào allow-list thay vì `*` để giữ nguyên tắc allow rõ ràng, không phải config khác.

#### Consequences

- `pnpm -r build` pass; extension 53 tests + server 36 tests pass.
- Cần restart server để CORS mới áp dụng (`pnpm --filter=@leetcode/server dev`).
- Reload extension sau khi sửa `content.js` (content script chạy trực tiếp, không qua build).
- `assets/toast-text.svg` viewBox 512x512, text mặc định 60.5px — `generateToastSvg` tự thay thành text cần hiển thị.
- History: `AI/history/2026-08/widget-animated-images-and-overwrite.md`.

### [2026-08-31] Server refactor sang MVC / phân tầng (routes → controllers → services)

#### Context

`apps/server/src/index.ts` (251 dòng) gói toàn bộ: load env, config, register static, CORS, hydrate engine và 10 route handlers inline (Zod validate inline). Khó đọc, khó mở rộng (thêm API phải sửa entry), khó test (logic bị dính vào Fastify reply/request).

#### Decision

- Tách server thành các lớp theo MVC / clean architecture:
  - `src/index.ts` — entry thuần: env + `createApp()` + hydrate + listen.
  - `src/app.ts` — `createApp()`: tạo Fastify instance, đăng ký plugins + routes (tách khỏi listen để dễ test).
  - `src/config.ts` — đọc env một chỗ (PORT, HOST, API_URL, ASSETS_ROOT).
  - `src/plugins/` — `cors.ts` (onSend hook + OPTIONS), `static.ts` (@fastify/static cho /assets/*).
  - `src/routes/` — chỉ khai báo method + path (health, problems, index prefix /api).
  - `src/controllers/` — Zod validate + quyết định status code/shape response, KHÔNG truy cập DB.
  - `src/services/` — logic nghiệp vụ: `problem.service.ts` (hydrate, list, getById, run, hint, getHints, getAssets, exists, importClip), `asset.service.ts` (chuyển từ `src/assets.ts`).
- Dependency injection đơn giản qua constructor/factory (service nhận `ProblemDatabase` + engine, controller nhận service) — không dùng thư viện DI (tránh over-engineering).
- `ProblemService.run` trả discriminated union `RunOutcome` (`ok: true`/`reason: "not-found"`/`reason: "invalid-code"`) để controller map sang HTTP status.

#### Reason

- Tuân theo CONVENTIONS: function nhỏ, trách nhiệm đơn nhất, abstraction vừa đủ, tránh over-engineering.
- Tách logic khỏi Fastify giúp test đơn vị dễ (đã thêm `problem.service.test.ts` 6 tests; tổng server 11 tests).
- Mở rộng API mới chỉ cần thêm route + controller, không đụng entry.

#### Consequences

- Refactor thuần: API/response/status giữ nguyên, `packages/*` và `apps/web`/`apps/extension` không đổi.
- `apps/server/src/assets.ts` cũ đã xóa, chuyển thành `services/asset.service.ts` (giữ nguyên `downloadAndRewriteImages`, test chỉ đổi import path).
- `index.ts` giảm còn ~25 dòng; toàn bộ 9 endpoint hoạt động y hệt (đã smoke-test: health, list 5, import 201, run 200, duplicate 409).
- Lint server vẫn lỗi sẵn từ trước do repo chưa có `eslint.config.*` (không phải do refactor này).

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

### [2026-08-31] Archive AI/index/, AI/ARCHITECTURE.md, AI/walkthrough/ — dùng GitNexus thay thế

#### Context

GitNexus đã được cài đặt (v1.6.10) và index toàn bộ monorepo (2.353 symbols, 3.718 edges, 56 clusters, 88 flows). Các file `AI/index/`, `AI/ARCHITECTURE.md`, `AI/walkthrough/` được viết tay, nhanh lỗi thời, tốn token khi agent đọc. GitNexus tự động đồng bộ với source code, biết import/dependency/cluster/execution flow.

#### Decision

- Archive `AI/index/` (4 files), `AI/ARCHITECTURE.md`, `AI/walkthrough/` (6 files) vào `AI/history/archived/`.
- Xóa `CLAUDE.md` và `.claude/` (do gitnexus setup tạo cho Claude Code, không dùng với OpenCode).
- Cập nhật `AGENTS.md`, `AI/INDEX.md`, `AI/README.md`, và các skills (bug-fix, context-cleanup, database-change, docs-generator, walkthrough) để không tham chiếu file đã archive.
- Agent dùng GitNexus (`query`, `context`, `impact`) để hiểu codebase thay vì đọc index/ARCHITECTURE/walkthrough.
- Skills GitNexus vẫn dùng qua `AGENTS.md` (CLI table trỏ `AI/skills/` thay `.claude/skills/`).

#### Reason

- Tiết kiệm token: agent không đọc ~10 file tĩnh (~600 dòng) mỗi lần khởi động.
- Luôn đồng bộ: GitNexus phản ánh source code thật, không lỗi thời.
- Giảm maintenance: không cập nhật index/ARCHITECTURE/walkthrough bằng tay nữa.

#### Consequences

- File archive vẫn giữ nguyên trong `AI/history/archived/` để tham khảo lịch sử.
- Agent bắt buộc phải dùng GitNexus MCP tools (đã cấu hình trong OpenCode).
- `AGENTS.md` GitNexus section đã cập nhật CLI table trỏ `AI/skills/` thay `.claude/`.

### [2026-08-31] Fix extension clip — template nhiễm shipWithinDays và thiếu testCases cho 1091

#### Context

Clip `1091. Shortest Path in Binary Matrix` cho JSON `template: "shipWithinDays"` (bài 1011) và `testCases: undefined`. LeetCode SPA giữ `window.monaco` models của các bài đã mở, `extractTemplate` lấy `models[0]` (cũ nhất) trước `code_editor` DOM nên nhiễm. `extractTestCases` chỉ dựa `hidden cm-content (opacity-0)` và `__NEXT_DATA__.testCases` dạng object, bỏ qua `exampleTestcases` string và `description <pre>` — nơi duy nhất `1091` có dữ liệu.

#### Decision

- **Template**: đổi thứ tự `extractTemplate` thành `code_editor DOM → __NEXT_DATA__ codeSnippets → monaco view-lines → window.monaco (duyệt ngược + lọc javascript + regex)`. `window.monaco` xuống cuối, duyệt `models.length-1 → 0`, ưu tiên `getLanguageId() === "javascript"` và regex `/function|class|var|let|const|return|=>/`.
- **TestCases**: mở rộng `extractTestCases` thành 4 nguồn: `hidden cm-content` (thêm selector `div[class*="opacity-0"][class*="h-0"]` + fallback quét `.cm-content` có parent `opacity-0`/`h-0`) → `visible console` → `__NEXT_DATA__` (thêm parser `exampleTestcases`/`exampleTestcaseList`/`jsonExampleTestcases` string qua `parseExampleTestcasesString` tách `\n` + `JSON.parse`) → `description <pre>` fallback qua `extractTestCasesFromDescription` (regex `Input: grid = [[...]]` + `Output: 2` → `{grid: [...]}` → `expected`).
- Đồng bộ `apps/extension/content.js` 1-1 với `src/clipper.ts` (4 hàm mới).
- Thêm 4 tests regression trong `clipper.test.ts` (ưu tiên code_editor, fallback __NEXT_DATA__, description 3 cases, buildProblemClip 1091).

#### Reason

- `code_editor` DOM là nguồn chính xác nhất cho bài hiện tại, tránh nhiễm cross-problem do SPA cache.
- `__NEXT_DATA__` đáng tin cậy hơn global memory, nên đứng trước `window.monaco`.
- `description <pre>` luôn tồn tại (Example) nên là fallback an toàn nhất cho testCases khi LeetCode đổi DOM console.

#### Consequences

- `pnpm --filter=@leetcode/extension test` → 53 pass (49 cũ + 4 mới).
- Clip `1091` giờ cho `template: "shortestPathBinaryMatrix"` và `testCases.length === 3` (`grid → 2/4/-1`).
- Cần giữ đồng bộ `content.js` khi sửa `clipper.ts` (hiện làm thủ công, có thể thêm script generate).
