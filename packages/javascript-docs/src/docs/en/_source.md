# Nguồn tmp_reference

- **Repo gốc**: https://github.com/Kernix13/javascript-cheat-sheet
- **Clone ngày**: 2026-08-31
- **Lệnh clone**: `git clone https://github.com/Kernix13/javascript-cheat-sheet.git packages/javascript-docs/tmp_reference`
- **Đã xóa** thư mục `.git` bên trong để tránh nested git repo; giữ nguyên toàn bộ `*.md` để làm source cho việc sinh JSON.

## Danh sách file .md (13 file)

| File | Dòng | Headings | Code blocks |
|------|------|----------|-------------|
| array-examples.md | 2408 | 39 | 63 |
| conditionals-examples.md | 280 | 10 | 9 |
| fcc-lessons.md | 508 | 12 | 5 |
| function-examples.md | 1567 | 40 | 54 |
| loop-examples.md | 305 | 11 | 12 |
| notes.md | 878 | 29 | 10 |
| number-date-examples.md | 1465 | 38 | 55 |
| object-examples.md | 1220 | 26 | 47 |
| practical-examples.md | 111 | 2 | 1 |
| react.md | 461 | 39 | 21 |
| README.md | 839 | 29 | 1 |
| regex-examples.md | 695 | 17 | 35 |
| string-examples.md | 663 | 25 | 24 |

- **Script sinh JSON**: `packages/javascript-docs/scripts/generate.py`
- **Output**: `packages/javascript-docs/src/data/*.json` + `index.json` + `all.json` (287 entries, 435 keywords)
- **Cập nhật**: nếu pull mới từ upstream, chạy `git -C tmp_reference pull` (nếu còn .git) hoặc clone lại rồi chạy `python scripts/generate.py`.
