# Architecture

## Tổng quan

Monorepo dạng pnpm workspace gồm 3 ứng dụng (`apps/web`, `apps/server`, `apps/extension`) và 6 package dùng chung (`packages/*`). Dependency chảy theo hướng `apps → packages`; các package có thể phụ thuộc lẫn nhau (ví dụ `problem-engine` phụ thuộc `database` và `shared`).

`problem-engine` dùng **in-memory registry** (`Map`) + **SQLite** (`packages/database`) làm persistence. Server hydrate `engine` từ SQLite khi khởi động. Dữ liệu đề bài được đưa vào qua **LeetCode Widget Extension** (DOM clip → JSON → `POST /api/problems/import` trực tiếp tới server, host cấu hình ở root `.env`). Ảnh trong `description` được tải về `packages/database/data/assets/<slug>/` với dedupe SHA-256 lưu trong DB (`problem_assets`). Hints và template/url được lưu riêng (`hints`, `problems.template/url`).

## Thành phần

```text
apps/web                  # React SPA (Vite + Tailwind CSS 4 + React Router DOM 7): layout Header + Sidebar + ProblemDetail (mô tả HTML, hints, template, editor syntax-highlight), theme light/dark bằng CSS variables + data-theme, đọc VITE_API_URL từ root .env
apps/server               # Fastify (MVC/phân tầng): routes/ → controllers/ → services/ → plugins/; GET/POST /api/problems/..., POST /api/problems/import (validate chặt, tải ảnh → assets DB), GET /assets/* static, GET /api/problems/:id/hints|assets, đọc PORT/HOST/API_URL từ root .env
apps/extension            # MV3 Browser Extension: widget nổi trên leetcode.com/problems/*, clip DOM (description + hints + template) → POST trực tiếp tới API_URL (đọc từ api-config.js sinh từ root .env) + clipboard fallback
packages/shared           # Types & utils dùng chung (ProblemMeta, ProblemClip với url/template/hints, Difficulty)
packages/database         # Drizzle ORM + SQLite (bảng problems + problem_assets + hints) + assets folder (data/assets/<slug>/)
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
apps/server (Fastify, PORT/HOST/API_URL từ root .env, kiến trúc MVC/phân tầng)
  entry src/index.ts → createApp() (src/app.ts: plugins + routes) → hydrate engine → listen
  layers: routes/* (path) → controllers/* (Zod validate + trả response) → services/* (logic nghiệp vụ) → plugins/* (CORS, static)
  ├─ GET /health
  ├─ GET /assets/*                  → serve file từ packages/database/data/assets/<slug>/ (ảnh đã tải, dedupe SHA-256 lưu DB problem_assets)
  ├─ GET /api/problems              → problemDb.getAllWithHints() (đã hydrate)
  ├─ GET /api/problems/:id          → engine.get(id) + DB hints/assets → fallback problemDb.get(id) + assets
  ├─ GET /api/problems/:id/hints    → problemDb.getHints(id)
  ├─ GET /api/problems/:id/assets   → problemDb.findAssetsByProblem(id)
  ├─ GET /api/problems/random/:difficulty?
  │                                 → engine.getRandom(difficulty)
  ├─ POST /api/problems/:id/run     → lọc comment (solution.util.stripComments) → trích hàm giải duy nhất (extractSolutionFunction) → wrapSolution (spread input) → engine.runTestsDetailed (trả per-case results input/expected/actual/error)
  ├─ POST /api/problems/:id/hint    → ai.getHint (placeholder)
  ├─ POST /api/playground/:slug     → playground.service.saveToPlayground (ghi playground/<slug>.js + tìm dòng body) → mở VS Code
  └─ POST /api/problems/import      → validate chặt (null check, Zod strict, url/template/hints) → engine.register + problemDb.add (FK ok) → downloadAndRewriteImages (fetch Buffer → SHA-256 → DB problem_assets dedupe → lưu assets/<slug>/{name}) → update description + hints (201/409)
```

apps/web (Vite, port 5173, envDir=root, VITE_API_URL từ root .env)
  ├─ main.tsx: BrowserRouter + ThemeProvider (data-theme + localStorage) → App.tsx (Routes)
  ├─ Layout: Header (bấm logo ẩn/hiện sidebar + theme toggle) + Sidebar (GET /api/problems, search + filter difficulty) + <Outlet />
  ├─ /problems/:id → ProblemDetail: GET /api/problems/:id → description (sanitize) trái + hints + CodeEditor (contentEditable + react-syntax-highlighter) phải → POST /api/problems/:id/run + nút "VS Code" (POST /api/playground/:slug → mở vscode://file/<path>:<line>:<column>)
  └─ Không còn nhập đề thủ công: việc import do extension POST thẳng tới server

apps/extension (MV3, leetcode.com/problems/*, host_permissions gồm leetcode + localhost/* + API host từ .env)
  ├─ api-config.js: var LC_API_BASE = "http://localhost:3000" (auto-gen từ root .env via pnpm sync:config)
  └─ content.js: widget LC (draggable) → buildProblemClip(doc) → validate (id/title/difficulty/description/tags != null) → clipboard + fetch POST ${API_BASE}/api/problems/import (JSON body) → toast success/409/error
```

## Data Flow

```text
Clip (direct): leetcode.com DOM [data-track-load="description_content"] + tags a[href^="/tag/"] + hints (lightbulb + HTMLContent) + template (monaco .view-line) → ProblemClip JSON (id/slug/url/title/difficulty/tags/description/template/hints) → extension POST trực tiếp tới ${API_URL}/api/problems/import (host từ root .env) → server validate → engine.register + problemDb.add (tạo FK) → tải ảnh (<img src>) → Buffer → SHA-256 → DB problem_assets dedupe (check hash) → lưu packages/database/data/assets/<slug>/{name} + rewrite description src → update DB description → web GET /api/problems hiển thị list
Read: engine (hydrate từ DB khi start) + problemDb.getAllWithHints / get(id)+hints+assets → API → web (description đã chứa /assets/... trỏ tới server, ảnh serve qua GET /assets/*, hints/template hiển thị riêng trong ProblemDetail)
```

Dữ liệu đề bài vào qua **Clipper Extension** (DOM) thay vì seed/API LeetCode. `engine.register` vừa ghi in-memory vừa `problemDb.add` (fire-and-forget + await đảm bảo); server hydrate lại từ SQLite khi khởi động để không mất dữ liệu sau restart. Seed script đã bị bỏ. Ảnh được xử lý: HTTP Response → Buffer → SHA-256 → kiểm tra DB `problem_assets` (hash) đã tồn tại chưa → nếu mới thì ghi file + insert `problem_assets` (problem_id, original_url, local_path, hash), nếu trùng thì reuse `localPath` cũ (tránh lưu trùng file) và vẫn insert row per-problem để tracking. Hints lưu bảng `hints` (problem_id, ord, content). Template/url/slug lưu trong `problems` (bỏ cột `solution`).

## External Services

Chưa xác định. `packages/ai` chỉ là placeholder, chưa gọi LLM API thật.

## Database

- SQLite qua `@libsql/client`, DB file tại `packages/database/data/leetcode.db` (path resolve cố định từ `client.ts`, không phụ thuộc CWD).
- Drizzle ORM với schema `problems` + `problem_assets` + `hints` (`packages/database/src/schema.ts`).
- Migrations: `0000_init` (problems với solution, seed 3 problems) → `0001_add_url_template_hints_assets` (thêm `slug`/`url`/`template`, bỏ `solution`, tạo `problem_assets` (id, problem_id FK, original_url, local_path, hash + index hash/problem), `hints` (id, problem_id FK, ord, content)).
- **Auto-migrate lúc runtime**: `client.ts` gọi `migrate()` mỗi khi import → tự tạo/cập nhật schema (đã fix 0000 dùng `text` thay `NVARCHAR(MAX)` để SQLite không lỗi `near "MAX"`).
- CLI migration (optional): `db:migrate` (drizzle-kit, dùng `@libsql/client` không cần native build). Đã bỏ `db:push`.
- Các script: `db:generate`, `db:migrate`, `db:studio`.
- **Assets**: ảnh từ `description` được lưu tại `packages/database/data/assets/<slug>/{name}` (slug sanitize, filename từ URL + content-type), dedupe qua SHA-256 hash lưu ở DB `problem_assets` (hash → localPath, per-problem tracking). Folder `assets` được `.gitignore`, serve qua `GET /assets/*` (fastifyStatic). Đã bỏ `.hash-index.json` (chuyển sang DB).
- **Hints**: mỗi problem có 0..n hints, lưu `hints` (ord giữ thứ tự), parse từ DOM LeetCode (lightbulb Hint N + `HTMLContent_html__*`).
- **Problems**: thêm `slug` (text), `url` (text), `template` (text), bỏ `solution` (đã drop column).
- README ghi kế hoạch: in-memory → SQLite → PostgreSQL.

## Deployment

- `apps/web` và `apps/server` chưa có cấu hình deploy. Host/port đọc từ root `.env` (`PORT`, `HOST`, `API_URL`, `VITE_API_URL`, `EXTENSION_API_URL`) — sửa một chỗ áp dụng cho toàn monorepo (xem `.env.example`, `apps/web/vite.config.ts: envDir=root`, `apps/server/src/config.ts` + `index.ts: dotenv`, `apps/extension/scripts/sync-api-url.mjs`).
- `apps/extension` là MV3 unpacked: load thủ công qua `chrome://extensions` → `Load unpacked` chọn `apps/extension` (không qua store). Trước khi load, chạy `pnpm --filter=@leetcode/extension sync:config` (hoặc `build` tự chạy prebuild) để sync `api-config.js` từ root `.env`. Manifest `host_permissions` bao gồm `leetcode.com` + `localhost` + origin của `API_URL`.

## Architectural Decisions

Xem:

`context/decisions.md`

---

> File này phải phản ánh implementation thực tế.
