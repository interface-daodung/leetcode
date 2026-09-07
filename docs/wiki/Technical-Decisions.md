# Technical Decisions {#technical-decisions}

> Các quyết định kỹ thuật quan trọng và lý do. Xem chi tiết trong `AI/context/decisions.md`.

---

## [2026-09-04] Nhắc code LeetCode: data-driven + regex, không AI/không Monaco

**Context**: Cần autocomplete trong CodeEditor để giảm lỗi chính tả, tăng tốc gõ LeetCode JS.

**Decision**:
- Không AI, không LSP, không Monaco — editor contentEditable + Prism giữ nguyên
- Data + logic pure trong `packages/javascript-docs/src/suggest/` (luật phân tầng 3)
  - Snippets/patterns hand-written (`snippets.json`, `members.ts`, `keywords.ts`)
  - API build từ `docsIndex.entries` có sẵn
  - `detectContext`/`extractVars`/`suggestForCode` bằng regex
- UI dropdown trong `apps/web/src/components/CodeEditor.tsx` (luật 4)
- Type inference chỉ nhận khai báo trực tiếp — không AST, không chain inference

**Reason**: Nguyên liệu LeetCode JS hữu hạn → liệt kê tay + tái dùng docsIndex rẻ và kiểm soát. Monaco = rewrite + 5MB bundle. Regex đủ đúng ở scale bài LeetCode.

---

## [2026-08-31] Mở khóa AI tự chủ thao tác git (chỉ cục bộ)

**Context**: Trước đây AI phải xin phép commit, gián đoạn tiến độ.

**Decision**:
- AI tự chủ commit/tạo nhánh/merge cục bộ
- Commit thường xuyên, message đúng convention
- Tự tạo nhánh `feat/<name>` / `fix/<name>`
- Merge nội bộ được phép
- **KHÔNG push/publish/PR** — remote chỉ do user chủ động

**Reason**: Giữ tiến độ liên tục, mỗi phần việc một commit dễ review/rollback. Repo là learning lab cá nhân.

---

## [2026-08-31] Widget ảnh động + Toast SVG động + Backend ghi đè problem

**Context**: Widget chỉ text, toast font cố định, 409 chặn ghi đè.

**Decision**:
- Widget 4 trạng thái PNG (`Idle/Loading/Success/Error.png`) + Squash & Stretch 1.2s animation
- Toast SVG động: fetch template → parse transform → bbox → font-size 24-72px auto → wrap → build tspan
- Backend thêm `PUT /api/problems/:id` + `updateClip()` service
- Extension tự retry PUT khi 409

**Reason**: Ảnh PNG cảm giác "sống", Squash & Stretch nguyên tắc Disney. Toast SVG dùng 1 khung, auto-scale. PUT idempotent, không mất assets cũ.

---

## [2026-08-31] Server refactor sang MVC / phân tầng

**Context**: `index.ts` 251 dòng gói toàn bộ, khó đọc/mở rộng/test.

**Decision**:
- Tách: `index.ts` (entry) → `app.ts` (createApp) → `config.ts` → `plugins/` → `routes/` → `controllers/` → `services/`
- DI đơn giản qua constructor/factory
- `ProblemService.run` trả discriminated union `RunOutcome`

**Reason**: Tuân theo CONVENTIONS (function nhỏ, trách nhiệm đơn nhất). Tách logic khỏi Fastify giúp test đơn vị dễ.

---

## [2026-08-30] LeetCode Clipper — chọn DOM clip thay vì LeetCode API

**Context**: Cần đưa đề bài thật vào hệ thống. LeetCode GraphQL API không ổn định, rate-limit, đổi schema.

**Decision**:
- Browser extension MV3 đọc DOM đã render trên `leetcode.com/problems/*`
- Selector chính: `[data-track-load="description_content"]` (fallback có sẵn)
- Extension copy `ProblemClip` JSON vào clipboard; web paste → preview → POST `/import`
- Server hydrate engine từ SQLite khi khởi động
- `ProblemClip` type ở `packages/shared` để đồng bộ

**Reason**: Tận dụng DOM đã render, không phụ thuộc API/auth. Luồng offline, đơn giản, dễ bảo trì.

---

## [2026-08-30] Direct import + env host + assets dedupe

**Context**: Host hard-code rải rác, extension chỉ copy clipboard, ảnh cần lưu local + dedupe.

**Decision**:
- Host tập trung vào root `.env` (PORT/HOST/API_URL/VITE_API_URL/EXTENSION_API_URL)
- Extension POST trực tiếp `/import` + copy clipboard fallback
- Server `downloadAndRewriteImages`: fetch → Buffer → SHA-256 → check hash-index → reuse hoặc write mới → rewrite src
- Serve ảnh qua `@fastify/static` tại `/assets/*`

**Reason**: Một chỗ sửa host áp dụng toàn monorepo. Direct POST bỏ bước paste. Lưu local offline, tránh CORS/hotlink, dedupe SHA-256.

---

## [2026-08-30] DB migration: bỏ .hash-index.json, thêm hints/template/url + problem_assets

**Context**: `.hash-index.json` ngoài DB, khó quản lý per-problem, không FK. Cần `template` (code khởi tạo), `url` (link gốc), hints.

**Decision**:
- Xóa `.hash-index.json`, migration `0001_add_url_template_hints_assets`
- `problems`: thêm `slug`/`url`/`template`, xóa `solution`
- Tạo `problem_assets` (FK cascade, hash index dedupe toàn cục)
- Tạo `hints` (FK cascade, ord)
- Sửa `0000_init.sql` dùng `text` thay `NVARCHAR(MAX)` fix SQLite error
- `ProblemDatabase` thêm `getAllWithHints`, `getHints/setHints`, `addAsset/findAssetByHash`, `updateDescription/update`

**Reason**: Assets/hints trong DB giúp query per-problem, FK cascade, dedupe toàn cục qua hash index. `template` thay `solution` vì clip lấy code khởi tạo.

---

## [2026-08-31] Archive AI/index/, AI/ARCHITECTURE.md, AI/walkthrough/ — dùng GitNexus

**Context**: GitNexus đã index toàn bộ monorepo (2.353 symbols, 3.718 edges, 56 clusters, 88 flows). File tĩnh nhanh lỗi thời, tốn token.

**Decision**:
- Archive `AI/index/`, `AI/ARCHITECTURE.md`, `AI/walkthrough/` → `AI/history/archived/`
- Xóa `CLAUDE.md` và `.claude/`
- Agent dùng GitNexus (`query`, `context`, `impact`) thay vì đọc file tĩnh

**Reason**: Tiết kiệm token, luôn đồng bộ source code, giảm maintenance.

---

## [2026-08-31] Fix extension clip — template nhiễm shipWithinDays và thiếu testCases cho 1091

**Context**: Clip `1091` cho template bài `1011` và `testCases: undefined`.

**Decision**:
- Template: đổi thứ tự `code_editor DOM → __NEXT_DATA__ → view-lines → window.monaco (duyệt ngược + lọc javascript + regex)`
- TestCases: mở rộng 4 nguồn (hidden → console → __NEXT_DATA__ exampleTestcases string → description `<pre>` fallback)
- Đồng bộ `content.js` 1-1 với `clipper.ts`
- Thêm 4 tests regression

**Reason**: `code_editor` DOM chính xác nhất cho bài hiện tại. `__NEXT_DATA__` đáng tin cậy hơn global memory. Description `<pre>` luôn tồn tại (Example) → fallback an toàn.

---

## [2026-08-30] Fix `created_at` default

**File**: `packages/database/src/schema.ts:14`

**Issue**: Lưu chuỗi `"(datetime('now'))"` thay vì datetime thật.

**Fix**: `default(sql`(datetime('now'))`)` (commit `fa9c962`)

---

## [2026-08-31] CORS PUT fix cho extension overwrite

**File**: `apps/server/src/plugins/cors.ts`

**Issue**: Extension PUT `/api/problems/:id` bị chặn preflight (CORS allow GET,POST,OPTIONS only).

**Fix**: `CORS_METHODS = "GET, POST, PUT, OPTIONS"` cho cả `onSend` hook và `app.options("/*", ...)`