# Architecture

## Tổng quan

Monorepo dạng pnpm workspace gồm 3 ứng dụng (`apps/web`, `apps/server`, `apps/extension`) và 6 package dùng chung (`packages/*`). Dependency chảy theo hướng `apps → packages`; các package có thể phụ thuộc lẫn nhau (ví dụ `problem-engine` phụ thuộc `database` và `shared`).

`problem-engine` dùng **in-memory registry** (`Map`) + **SQLite** (`packages/database`) làm persistence. Server hydrate `engine` từ SQLite khi khởi động. Dữ liệu đề bài được đưa vào qua **LeetCode Clipper Extension** (DOM clip → JSON → `POST /api/problems/import` trực tiếp tới server, host cấu hình ở root `.env`). Ảnh trong `description` được tải về `packages/database/data/assets/<slug>/` với dedupe SHA-256.

## Thành phần

```text
apps/web                  # React SPA: editor + ProblemImportPaste (paste JSON → preview → save), đọc VITE_API_URL từ root .env
apps/server               # Fastify: GET/POST /api/problems/..., POST /api/problems/import (validate chặt, tải ảnh → assets), GET /assets/* static, đọc PORT/HOST/API_URL từ root .env
apps/extension            # MV3 Browser Extension: widget nổi trên leetcode.com/problems/*, clip DOM → POST trực tiếp tới API_URL (đọc từ api-config.js sinh từ root .env) + clipboard fallback
packages/shared           # Types & utils dùng chung (ProblemMeta, ProblemClip, Difficulty)
packages/database         # Drizzle ORM + SQLite (bảng problems) + assets folder (data/assets/<slug>/)
packages/editor           # EditorState, languageTemplates
packages/problem-engine   # Problem registry + runTests (in-memory + DB hydrate)
packages/ai               # getHint/explainSolution (placeholder)
packages/javascript-docs  # jsDocs/getDoc (static)
```

## Dependency Flow

```text
apps/web ──> shared, editor
apps/server ──> shared, database, problem-engine, ai
apps/extension ──> (độc lập, vanilla JS; logic thuần src/clipper.ts, không phụ thuộc workspace build)
problem-engine ──> shared, database
database ──> shared, drizzle-orm, @libsql/client
editor ──> shared
ai ──> shared
javascript-docs ──> shared
```

## Runtime Flow

```text
apps/server (Fastify, PORT/HOST/API_URL từ root .env) — có CORS, hydrate từ DB khi khởi động, serve static /assets/*
  ├─ GET /health
  ├─ GET /assets/*                  → serve file từ packages/database/data/assets/<slug>/ (ảnh đã tải)
  ├─ GET /api/problems              → problemDb.getAll() (đã hydrate)
  ├─ GET /api/problems/:id          → engine.get(id) → fallback problemDb.get(id)
  ├─ GET /api/problems/random/:difficulty?
  │                                 → engine.getRandom(difficulty)
  ├─ POST /api/problems/:id/run     → new Function + engine.runTests
  ├─ POST /api/problems/:id/hint    → ai.getHint (placeholder)
  └─ POST /api/problems/import      → validate chặt (null check, Zod strict) → downloadAndRewriteImages (fetch Buffer → SHA-256 dedupe → lưu assets/<slug>/{name}) → engine.register + problemDb.add (201/409)

apps/web (Vite, port 5173, envDir=root, VITE_API_URL từ root .env)
  ├─ App.tsx: createEditorState + run code cục bộ + fetch GET /api/problems (list từ DB, hiển thị ngay sau import)
  └─ components/ProblemImportPaste: paste JSON → parseProblemClipJson → preview (sanitize) → POST /api/problems/import (dùng API_BASE từ VITE_API_URL)

apps/extension (MV3, leetcode.com/problems/*, host_permissions gồm leetcode + localhost/* + API host từ .env)
  ├─ api-config.js: var LC_API_BASE = "http://localhost:3000" (auto-gen từ root .env via pnpm sync:config)
  └─ content.js: widget LC (draggable) → buildProblemClip(doc) → validate (id/title/difficulty/description/tags != null) → clipboard + fetch POST ${API_BASE}/api/problems/import (JSON body) → toast success/409/error
```

## Data Flow

```text
Clip (direct): leetcode.com DOM [data-track-load="description_content"] + tags a[href^="/tag/"] → ProblemClip JSON → extension POST trực tiếp tới ${API_URL}/api/problems/import (host từ root .env) → server validate → tải ảnh (<img src>) → Buffer → SHA-256 dedupe → lưu packages/database/data/assets/<slug>/{name} + rewrite description src → engine.register + problemDb.add → web GET /api/problems hiển thị list
Clip (fallback): ProblemClip JSON → clipboard → web paste (ProblemImportPaste) → POST /api/problems/import (cùng flow tải ảnh)
Read: engine (hydrate từ DB khi start) + problemDb.getAll / get(id) → API → web (description đã chứa /assets/... trỏ tới server, ảnh serve qua GET /assets/*)
```

Dữ liệu đề bài vào qua **Clipper Extension** (DOM) thay vì seed/API LeetCode. `engine.register` vừa ghi in-memory vừa `problemDb.add` (fire-and-forget + await đảm bảo); server hydrate lại từ SQLite khi khởi động để không mất dữ liệu sau restart. Seed script đã bị bỏ. Ảnh được xử lý: HTTP Response → Buffer → SHA-256 → kiểm tra `.hash-index.json` đã tồn tại chưa → nếu mới thì ghi file, nếu trùng thì reuse path cũ (tránh lưu trùng).

## External Services

Chưa xác định. `packages/ai` chỉ là placeholder, chưa gọi LLM API thật.

## Database

- SQLite qua `@libsql/client`, DB file tại `packages/database/data/leetcode.db` (path resolve cố định từ `client.ts`, không phụ thuộc CWD).
- Drizzle ORM với schema `problems` (`packages/database/src/schema.ts`).
- Migration đầu tiên: `packages/database/drizzle/0000_init.sql` (bao gồm seed 3 problems mẫu).
- **Auto-migrate lúc runtime**: `client.ts` gọi `migrate()` mỗi khi import → tự tạo/cập nhật schema.
- CLI migration (optional): `db:migrate` (drizzle-kit, dùng `@libsql/client` không cần native build). Đã bỏ `db:push`.
- Các script: `db:generate`, `db:migrate`, `db:studio`.
- **Assets**: ảnh từ `description` được lưu tại `packages/database/data/assets/<slug>/{name}` (slug sanitize, filename từ URL + content-type), dedupe qua SHA-256 hash lưu ở `.hash-index.json` (hash → relativePath). Folder `assets` được `.gitignore`, serve qua `GET /assets/*` (fastifyStatic).
- README ghi kế hoạch: in-memory → SQLite → PostgreSQL.

## Deployment

- `apps/web` và `apps/server` chưa có cấu hình deploy. Host/port đọc từ root `.env` (`PORT`, `HOST`, `API_URL`, `VITE_API_URL`, `EXTENSION_API_URL`) — sửa một chỗ áp dụng cho toàn monorepo (xem `.env.example`, `apps/web/vite.config.ts: envDir=root`, `apps/server/src/index.ts: dotenv`, `apps/extension/scripts/sync-api-url.mjs`).
- `apps/extension` là MV3 unpacked: load thủ công qua `chrome://extensions` → `Load unpacked` chọn `apps/extension` (không qua store). Trước khi load, chạy `pnpm --filter=@leetcode/extension sync:config` (hoặc `build` tự chạy prebuild) để sync `api-config.js` từ root `.env`. Manifest `host_permissions` bao gồm `leetcode.com` + `localhost` + origin của `API_URL`.

## Architectural Decisions

Xem:

`context/decisions.md`

---

> File này phải phản ánh implementation thực tế.
