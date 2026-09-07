# Plan: JavaScript Docs i18n — bản tiếng Việt + tổ chức data theo ngôn ngữ

Ngày: 2026-09-01

## Mục tiêu

1. Tạo `tmp_reference_vi/` — bản dịch tiếng Việt của 13 file `.md` trong `tmp_reference/`.
2. Sửa `scripts/generate.py` để sinh JSON vào `src/data/en/` (từ `tmp_reference/`) và `src/data/vi/` (từ `tmp_reference_vi/`).
3. Cập nhật `src/search.ts` + `src/index.ts` để nạp dữ liệu `en/` và hỗ trợ truy cập/tìm kiếm bộ `vi/` (đã xác nhận với user: **có** thêm search tiếng Việt).
4. Cập nhật test, docs (`README.md`), `AI/STATUS.md`, history.

## Phạm vi

- Package `@leetcode/javascript-docs` — không file nào ngoài package import nó (đã grep).
- JSON `src/data/*.json` hiện có: giữ nguyên nội dung tiếng Anh, di chuyển sang `src/data/en/`.
- File `packages/javascript-docs/tmp_reference/` (nguồn tiếng Anh, clone từ Kernix13) giữ nguyên — không sửa, chỉ dùng làm gốc để dịch.
- File `packages/javascript-docs/tmp_reference_vi/`: 13 file `.md` tiếng Việt mới.

## Thiết kế generate.py

- Thêm argument `--lang en|vi` (hoặc `--all`), mặc định `--all` để chạy cả hai.
- Map: `tmp_reference/` → `src/data/en/`, `tmp_reference_vi/` → `src/data/vi/`.
- Output `index.json`, `all.json`, `*.json` đặt trong thư mục lang tương ứng.
- Cập nhật `generator`, `sourceRepo`, thêm `lang` field vào `index_doc` và `DocFile`.
- Giữ nguyên mọi field cấu trúc hiện có để không vỡ `types.ts`/`search.ts`.

## Thiết kế search.ts

- Import dữ liệu từ `./data/en/index.json` + `./data/en/*.json` (như cũ, chỉ đổi đường dẫn).
- Thêm API mới cho tiếng Việt: `searchDocsVi`, `getIndexVi`, `getDocFileVi`, `getDocFileSyncVi`, `getSectionByIdVi`, `getSectionByIdSyncVi`, `getAllDocFilesVi`, `getByCategoryVi`, `getByIdVi`, `getByKeywordVi`, `suggestCommandsVi`.
- Giữ nguyên API cũ (EN) — không phá vỡ consumer/test hiện có.

## Dịch thuật — chất lượng

Dịch toàn bộ nội dung `.md` sang tiếng Việt, **giữ nguyên cú pháp Markdown**:

- Tiêu đề `#`, `##`, `###`, `####` — dịch text, giữ level.
- `#anchor` trong link TOC / back-to-top / `related` — **giữ nguyên anchor tiếng Anh** (không đổi id).
- **Code block (```js/```) — KHÔNG dịch**, giữ nguyên byte-for-byte code. Nếu có `// comment` tiếng Anh giải thích, có thể dịch riêng phụ chú tiếng Việt ngoài block khi cần, nhưng **không sửa code**.
- Link ngoài (MDN, github) giữ nguyên.
- Đảm bảo file `*.md` giữ đủ headings để generate.py sinh đủ sections.

## Các bước

1. [x] Tạo nhánh `feat/javascript-docs-i18n`.
2. [ ] Sửa `scripts/generate.py` hỗ trợ en/vi.
3. [ ] Cập nhật `src/search.ts` import từ `en/` + thêm API Vi.
4. [ ] Cập nhật `src/index.ts` re-export API Vi.
5. [ ] Sửa `src/search.test.ts` (chuyển dữ liệu sang en/, thêm test Vi).
6. [ ] Tạo `tmp_reference_vi/` — dịch 13 file (agent tuần tự từng file, không phâ mảnh).
7. [ ] Chạy generate.py → sinh `src/data/vi/*.json` + cập nhật `src/data/en/*.json`.
8. [ ] `pnpm --filter=@leetcode/javascript-docs build && test && lint`.
9. [ ] Cập nhật `README.md`, `AI/STATUS.md`, `AI/history/`.
10. [ ] Commit từng phần việc, move plan sang completed.
