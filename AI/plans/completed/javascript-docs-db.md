# Plan: Lưu javascript-docs JSON data vào SQLite (thay JSON files)

Ngày: 2026-09-07

## Mục tiêu

Chuyển dữ liệu docs (`packages/javascript-docs/src/data/{en,vi}/*.json` — 287 sections × 2 lang) vào SQLite (`packages/database`) làm nguồn lưu trữ chính. JSON chỉ còn là artifact trung gian của `generate.py` (input cho seeder).

## Hiện trạng (đã xác nhận)

- `generate.py` parse `src/docs/{en,vi}/*.md` → `src/data/{en,vi}/*.json` (13 file/lang + `index.json` + `all.json`).
- `search.ts` import tĩnh 28 JSON, build cache: `index`, `keywordIndex`, docFiles map. Tất cả API (`searchDocs`, `getSectionByIdSync`, `suggestCommands`, `suggestForCode`...) đều sync, operate trên mảng in-memory.
- Consumers:
  - `apps/web/src/components/workspace/KnowledgeContext.tsx` — `searchDocs/searchDocsVi`, `getSectionByIdSync(Vi)` (sync, useMemo).
  - `apps/web/src/components/CodeEditor.tsx` — `suggestForCode(text, before)` (sync, mỗi keystroke) dùng `docsIndex` (EN).
  - `apps/web/src/pages/DocPage.tsx` — raw `.md` qua `import.meta.glob` (không liên quan JSON, không đổi).
- DB: Drizzle + libsql, auto-migrate runtime (`client.ts`), DB path cố định `packages/database/data/leetcode.db`.

## Quyết định thiết kế

1. **Schema** (2 bảng mới, migration `0002`):
   - `doc_files`: `id` (PK autoincrement), `lang` (`en|vi`), `source_file`, `source_url`, `category`, `title`, `description`, `tags` (json), `total_sections`; `UNIQUE(lang, source_file)`.
   - `doc_sections`: `id` (PK autoincrement), `lang`, `section_id` (id dạng text `array-push`), `doc_file_id` (FK cascade), `ord` (thứ tự trong file — dùng mapping en↔vi), `title`, `heading_level`, `anchor`, `summary`, `keywords` (json), `syntax`, `returns`, `mutates` (integer 0/1/null), `mdn_url`, `examples` (json), `tables` (json), `related` (json), `content`, `content_html`, `search_text`, `category`; `UNIQUE(lang, section_id)` + index `(lang, category)`, `(doc_file_id, ord)`.
   - `keywords/examples/tables/related` lưu JSON column (theo style `problems.tags` hiện có) — không tạo bảng phụ.
2. **Không lưu** `index.json`/`all.json`/`keywordIndex` vào DB — derived: server load sections lúc boot (287×2 rows, <6MB) rồi build index/keywordIndex in-memory như `search.ts` hiện tại. `searchText` vẫn lưu cột (tính lúc generate).
3. **`javascript-docs` thành pure logic**: bỏ 28 import JSON tĩnh; `search.ts`/`suggest` nhận data qua tham số (`searchDocsCore(query, entries, opts)`, `suggestForCode(text, before, entries)`). Package không còn phụ thuộc data → bundle web nhẹ đi ~5MB.
4. **Server expose API** (`apps/server`, đúng luật phân tầng — server chỉ wiring):
   - `docs.service.ts`: load sections từ DB lúc boot → build entries/keywordIndex → cache module-level.
   - `GET /api/docs/search?q=&lang=&category=&limit=` → IndexEntry[]
   - `GET /api/docs/section/:id?lang=` → DocSection đầy đủ
   - `GET /api/docs/meta` → entries (EN) cho suggest client
5. **Web đổi sang API**:
   - `KnowledgeContext`: search qua fetch debounce (thay useMemo sync); Result panel qua `/api/docs/section`.
   - `CodeEditor`: fetch `/api/docs/meta` 1 lần lúc mount → cache → `suggestForCode` giữ hành vi sync.
6. **Seeder** `packages/database/src/seed-docs.ts`: đọc JSON từ `packages/javascript-docs/src/data/{en,vi}` (exclude `index.json`/`all.json`), idempotent (DELETE theo lang → INSERT). Script `db:seed-docs` (tsx).
7. **Docker**: thêm bước seed vào pipeline build/runtime (nếu `doc_files` rỗng) — volume đã mount `packages/database/data`.

## Không đổi

- `generate.py` (output JSON giữ nguyên vai trò input seeder).
- `DocPage.tsx` raw `.md` (ngoài phạm vi — user chỉ yêu cầu JSON data).
- Static assets của suggest (`snippets.json`, `members.ts`, `keywords.ts`, `vars.ts`) — nhỏ, giữ trong package.
- Các bảng `problems`/`hints`/`problem_assets` hiện có.

## Các bước

1. [ ] Tạo nhánh `feat/docs-db`.
2. [ ] Schema + migration `0002_add_docs_tables.sql` (drizzle-kit generate, sửa tay nếu cần).
3. [ ] Seeder `seed-docs.ts` + script `db:seed-docs`; chạy seed → verify DB.
4. [ ] Refactor `javascript-docs`: search.ts pure (data qua tham số), suggest nhận entries; sửa `search.test.ts`/`suggest.test.ts` dùng fixture; build + test pass.
5. [ ] Server: `docs.service.ts` + routes `/api/docs/*` (Zod) + tests.
6. [ ] Web: KnowledgeContext fetch API; CodeEditor nạp entries 1 lần; build + tests pass.
7. [ ] Docker: seed khi boot nếu DB trống docs.
8. [ ] Docs: `AI/STATUS.md`, `AI/history/2026-09/docs-db.md`, decision nếu cần; move plan sang completed.

## Rủi ro / lưu ý

- en↔vi id lệch (slug dịch) — lookup section theo `section_id` là per-lang nên không sao; nếu cần cặp song ngữ dùng `(source_file, ord)`.
- `client.ts` mở DB lúc import (top-level `await migrate`) — `javascript-docs` tuyệt đối không import nó (phá web build). Data chỉ chảy qua server.
- Test server dùng DB thật (path cố định) — chỉ test service với fixture in-memory, không cần DB riêng.
