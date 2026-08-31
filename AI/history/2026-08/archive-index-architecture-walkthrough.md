# Archive AI/index/, AI/ARCHITECTURE.md, AI/walkthrough/ — dùng GitNexus thay thế

Ngày: 2026-08-31
Nhánh: `chore/gitnexus-setup`

## Tóm tắt

GitNexus đã được cài đặt (v1.6.10) và index toàn bộ monorepo. Các tài liệu viết tay `AI/index/`, `AI/ARCHITECTURE.md`, `AI/walkthrough/` được chuyển sang `AI/history/archived/` để tránh agent đọc lãng phí token, vì GitNexus tự động phản ánh source code thật (symbol, import, dependency, cluster, execution flow).

## Thay đổi

### Move sang `AI/history/archived/`

- `AI/ARCHITECTURE.md` → `AI/history/archived/ARCHITECTURE.md`
- `AI/index/{APP,DATA,PACKAGE,PROJECT}_STRUCTURE.md` → `AI/history/archived/index/`
- `AI/walkthrough/{ai,backend,database,execution,extension,frontend}.md` → `AI/history/archived/walkthrough/`
- Xóa `CLAUDE.md` + `.claude/` (gitnexus setup tạo cho Claude Code, không dùng với OpenCode).

### Cập nhật tham chiếu

- `AGENTS.md` — mục Khởi động: bỏ đọc `AI/index/` + `AI/walkthrough/`, thay bằng GitNexus (`query`/`context`/`impact`). GitNexus CLI table trỏ `AI/skills/` thay `.claude/skills/`.
- `AI/INDEX.md` — bỏ `ARCHITECTURE.md`/`index/`/`walkthrough/` khỏi cấu trúc, thêm note archive + flow khởi động mới.
- `AI/README.md` — mô tả cấu trúc mới, nhấn mạnh dùng GitNexus.
- Skills: `bug-fix`, `context-cleanup`, `database-change`, `docs-generator`, `walkthrough` — bỏ tham chiếu file đã archive, trỏ GitNexus/archive.
- `AI/context/decisions.md` — thêm decision mới.
- `AI/STATUS.md` — thêm mục Current Phase.

## Kiểm chứng

- `git mv` giữ nguyên lịch sử file.
- Không còn tham chiếu `.claude/` hay `AI/index/`/`AI/walkthrough/` trong AGENTS.md / INDEX.md / README.md / skills.

## Ghi chú

- File archive giữ nguyên trong `AI/history/archived/` để tham khảo lịch sử, không cập nhật nữa.
- Nếu cần hướng dẫn sử dụng cho người dùng, viết vào `docs/` (xem `skills/docs-generator`).
- Skills GitNexus hiện ở `AI/skills/` (do setup cài thêm), CLI table trong AGENTS.md đã trỏ tới đó.
