# feat(docs): raw markdown vào SQLite — web bỏ bundle .md (2026-09-07)

## Vấn đề

Build web còn các chunk lớn `notes-*.js` (57KB), `array-examples-*.js` (86KB), `function-examples-*.js`,
`number-date-examples-*.js`... Nguyên nhân: `apps/web/src/pages/DocPage.tsx` dùng
`import.meta.glob("...src/docs/{en,vi}/*.md", { query: "?raw" })` — Vite bundle toàn bộ 28 file `.md`
(~890KB × 2 lang) vào build, dù trang chỉ cần đọc 1 file theo route `/doc/:file`.

Feature trước (docs-db) đã chuyển search index + sections sang SQLite, riêng raw markdown cho DocPage chưa.

## Giải pháp

Lưu raw markdown vào DB, web fetch qua API:

1. **Migration `0004_add_doc_raw_markdown`** — `ALTER TABLE doc_files ADD COLUMN raw_markdown text`
   (SQL + snapshot 0004 copy từ 0003 + thêm cột + `_journal.json` idx 4).
2. **Seeder** (`packages/database/src/seed-docs.ts`) — đọc thêm `.md` cùng tên `sourceFile` từ
   `javascript-docs/src/docs/{lang}/` lưu vào `raw_markdown` (thiếu file → null, không crash).
   Thêm dep `@leetcode/javascript-docs: workspace:*` vào `packages/database` để `require.resolve` package.json
   tìm được thư mục docs (trước chỉ dep ngược chiều javascript-docs → shared).
3. **DB API** (`docs-db.ts`) — `getRawMarkdown(lang, sourceFile)` query 1 row,
   `listSourceFiles(lang)` (phòng dùng sau).
4. **Server** — `DocsService.getRawMarkdown` + route `GET /api/docs/file/:file?lang=`:
   Zod validate (file max 128), tự thêm `.md` suffix, fallback lang kia khi thiếu, 404 JSON chuẩn.
5. **Web** (`DocPage.tsx`) — bỏ 2 glob + `resolveModule`, thay bằng `fetch(API_BASE/api/docs/file/:file?lang=)`
   với AbortController; giữ nguyên render `marked` + slugify anchor + scroll hash.
   Route `/doc/:file` và link từ `KnowledgeResultPanel` không đổi.
6. **Dockerfile** — copy thêm `packages/javascript-docs/src/docs/` vào runtime để auto-seed
   (volume trống) có đủ raw markdown.

## Kết quả

- Build web: các chunk `*-examples`, `notes`, `number-date-examples`... biến mất hoàn toàn —
  `apps/web/dist/static` chỉ còn `index-*.js` 635KB (gzip 186KB).
- DB 26 rows doc_files đều có raw_markdown (26 file .md, đúng kích thước nguồn).
- Smoke test server: `/api/docs/file/notes?lang=vi` 200 (~55KB md VI), `/notes.md?lang=en` 200,
  file lạ → 404 `{"error":"Không tìm thấy file: khong-ton-tai.md"}`, search vẫn 200.
- `pnpm -r build` pass, `pnpm -r test` pass (server 44, web 14, extension 58, docs 48, admin 11, ai 6, engine 10).

## Gotcha

- Smoke chạy `node dist/index.js` cần package `main` trỏ `dist` — dùng `scripts/docker-build.mjs` patch tạm
  rồi khôi phục `main: src/index.ts` (repo chạy dev qua tsx). Docker build tự patch trong image, không ảnh hưởng source.
- `content` trong `doc_sections` không chứa heading + phần intro trước heading đầu — không đủ tái tạo md,
  phải lưu raw riêng (đây là lý do thêm cột thay vì ghép từ sections).

Commit: `a3defea` trên nhánh `feat/docs-db`.
