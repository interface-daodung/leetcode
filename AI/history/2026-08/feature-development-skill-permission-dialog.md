# Feature Development Skill: Permission Dialog + Plan Completion

Ngày: 2026-08-31

## Mục tiêu

Cập nhật skill `AI/skills/feature-development/SKILL.md` để quy trình phát triển feature có bước dừng lại hỏi người dùng trước khi thực thi kế hoạch.

## Thay đổi

- `AI/skills/feature-development/SKILL.md`:
  - Thêm bước 8: sau khi tạo plan hoàn chỉnh trong `AI/plans/active/<name>.md`, **dừng lại** và hiện Permission Dialog (TUI) qua plugin `opencode-quick-reply` để gợi ý câu trả lời, hỏi người dùng muốn **chạy luôn** hay **thay đổi** gì.
  - Thêm bước 9: chờ lựa chọn — nếu **Chạy** thì tiếp tục, nếu **Thay đổi** thì sửa plan rồi quay lại bước 8.
  - Đánh số lại workflow (7 → 15 bước).
  - Cập nhật bảng Plan Management: ghi rõ chạy bat từ repo root, truyền đúng `<name>` (không dấu cách) để tránh lỗi no output, và gọi bằng `&` cho chính xác (ví dụ `& .\AI\skills\feature-development\move-plan-to-completed.bat my-plan`).

## Ghi chú

- Hoàn thành plan vẫn dùng `AI\skills\feature-development\move-plan-to-completed.bat <name>` để move (không copy) từ `AI/plans/active/` sang `AI/plans/completed/`.
