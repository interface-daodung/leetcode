# Docs data vào SQLite (javascript-docs-db)

Ngày: 2026-09-07 — nhánh `feat/docs-db`

## Mục tiêu

Chuyển data Knowledge docs (`packages/javascript-docs/src/data/{en,vi}/*.json` — 287 sections × 2 lang) sang SQLite làm nguồn lưu trữ chính. JSON chỉ còn là artifact trung gian: `generate.py` → JSON → seeder → DB.

## Vì sao

- JSON tĩnh trước đây bị bundle thẳng vào web build (~5MB raw, tăng nặng bundle).
- Muốn một nguồn lưu trữ duy nhất cho data app (problems đã dùng SQLite).
- `index.json`/`all.json`/`keywordIndex` là dữ liệu derived — sinh runtime được, không cần lưu.

## Thay đổi chính

### Database (`packages/database`)

- Schema `doc_files` + `doc_sections` (migration `0002_add_docs_tables.sql`, drizzle-kit generate):
  - `doc_files`: lang, source_file (unique theo lang), category, title, tags json, total_sections.
  - `doc_sections`: lang, section_id, doc_file_id FK cascade, ord, title, heading_level, anchor, summary, keywords json, syntax, returns, mutates (0/1/null), mdn_url, examples json, tables json, related json, content, content_html, search_text, category. Index: (lang, section_id), (lang, category), (doc_file_id, ord).
  - Không lưu index.json/all.json/keywordIndex — derived.
- `src/docs-db.ts`: `DocsDatabase` (countFiles, getDocFiles theo lang, getSectionById) — map row → shape DocFile/DocSection (structural typing, không import ngược javascript-docs).
- `src/seed-docs.ts` + `scripts/seed-docs.ts` (CLI): seed idempotent (DELETE theo lang → INSERT) từ `src/data/{en,vi}/*.json`. Lệnh: `pnpm --filter=@leetcode/database db:seed-docs`.

### javascript-docs (pure)

- Bỏ 28 static JSON import trong `search.ts` — thay bằng `setDocsData({index, files}, {index, files})` (module-level, server boot / test fixture / web fetch đều nạp được).
- Thêm `buildKeywordIndex(entries)` — dùng null-prototype (keyword "constructor" trong data đụng `Object.prototype.constructor` nếu dùng object thường — bug thật khi chạy server).
- Mọi API sync cũ giữ nguyên tên: `searchDocs`, `searchDocsVi`, `getSectionByIdSync`, `getById`, `suggestCommands`... — throw có thông báo rõ nếu data chưa nạp.
- `docsIndex` export đổi sang Proxy lazy (đọc thật lúc truy cập property).
- Tests nạp data từ JSON artifact qua fs + `setDocsData` trong `beforeAll` (48 tests vẫn pass, assertion giữ nguyên).

### Server (`apps/server`)

- `services/docs.service.ts`: `hydrate()` — load từ DB (tự seed nếu rỗng) → `buildDocsIndex` → `setDocsData`. Search core chạy in-memory như cũ (287 rows × 2, không cần FTS).
- `services/docs-index.util.ts`: build DocsIndex từ DocFile DB shape (entries = section fields + tags cấp file; keywordIndex qua buildKeywordIndex).
- Routes `/api/docs/*`: `search`, `categories`, `section/:id`, `meta` (entries EN cho autocomplete client). Zod safeParse → 400 cho query sai.
- Boot: hydrate docs như hydrate problems (log warn nếu fail, không crash).

### Web (`apps/web`)

- `KnowledgeContext.tsx`: search + section fetch qua API (AbortController, giữ behavior debounce 180ms); `KNOWLEDGE_CATEGORIES` hard list 13 category thay vì gọi sync.
- `CodeEditor.tsx`: fetch `/api/docs/meta?lang=en` 1 lần lúc mount → `setDocsData` → `suggestForCode` giữ sync per-keystroke.
- **Bundle JS: ~6.5MB → 1.49MB** (số đo từ dist; phần còn lại là raw .md DocPage + libs).

### Docker

- `Dockerfile` runtime stage copy thêm `packages/javascript-docs/src/data/` — auto-seed lần đầu boot với volume trống.

## Data flow mới

```
src/docs/{en,vi}/*.md
  → scripts/generate.py (pnpm generate)
  → src/data/{en,vi}/*.json        (artifact, input cho seeder)
  → pnpm --filter=@leetcode/database db:seed-docs   (hoặc auto-seed khi server boot thấy DB rỗng)
  → SQLite: doc_files + doc_sections
  → server hydrate → setDocsData → /api/docs/* → web
```

## Lưu ý / Gotchas

- id en/vi lệch 147/287 (slug tiếng Việt dịch từ heading) — lookup theo `section_id` per-lang là đúng; mapping song ngữ dùng `(source_file, ord)`.
- `packages/javascript-docs` tuyệt đối không import `@leetcode/database` (client.ts mở DB top-level, sẽ vỡ web build). Data chỉ chảy server → API → web.
- `suggestForCode` trên client cần setDocsData trước; nếu server chưa boot xong, autocomplete rơi về keyword/snippet (không crash).
- JSON `src/data/` vẫn được commit — là artifact có kiểm soát, cần cho test + seeder + Docker.

## Test

- `pnpm -r build` + `pnpm -r test` pass (186 tests: extension 53, ai 6, docs 48, admin 11, engine 10, web 14, server 44 — server +2 mới cho docs-index.util).
- Smoke E2E local: server PORT=3000 → `/api/docs/search?q=push&lang=vi` → array-push; `/api/docs/section/string-split?lang=vi` → contentHtml 2915 chars; bad lang → 400; section lạ → 404.
