---
name: feature-development
description: Quy trình phát triển feature mới hoặc thay đổi lớn, kèm quản lý vòng đời plan trong AI/plans. Use when implementing features, thêm chức năng, refactor lớn, hoặc tạo/hoàn thành plan.
---

# Feature Development

## Trigger

Sử dụng khi phát triển feature mới hoặc thay đổi lớn.

## Workflow

1. Đọc `AI/INDEX.md`.
2. Đọc `AI/STATUS.md`.
3. Đọc `AI/CONVENTIONS.md`.
4. Xác định module.
5. Đọc index/walkthrough liên quan.
6. Kiểm tra dependency.
7. Tạo plan **hoàn chỉnh** và lưu vào `AI/plans/active/<name>.md` (xem Plan Management).
8. **Dừng lại** — hiện Permission Dialog (TUI) qua plugin `opencode-quick-reply` để gợi ý câu trả lời, hỏi người dùng: kế hoạch đã xong — muốn **chạy luôn** hay **thay đổi** gì không?
9. Chờ lựa chọn:
   - **Chạy**: tiếp tục các bước bên dưới.
   - **Thay đổi**: sửa plan trong `AI/plans/active/` rồi quay lại bước 8.
10. Tạo branch.
11. Implement.
12. Test.
13. Update documentation.
14. Ghi history.
15. Hoàn thành plan (xem Plan Management).

## Plan Management

| State | Task | Action |
|-------|------|--------|
| Planning | Create plan | Lưu vào `AI/plans/active/<name>.md` |
| Build | Edit plan | **Chỉ sửa** `AI/plans/active/` |
| Done | Complete plan | Chạy `AI\skills\feature-development\move-plan-to-completed.bat <name>` từ repo root |

- Script move file (không copy, tiết kiệm token). Chạy từ **repo root** vì dùng đường dẫn tương đối `AI\plans\...`. Bắt buộc truyền đúng `<name>` (không dấu cách, khớp tên file plan) để tránh lỗi no output.
- Khi plan xong, gọi bat bằng `&` cho chính xác, ví dụ: `& .\AI\skills\feature-development\move-plan-to-completed.bat my-plan`.
- Không coi feature hoàn thành nếu chưa test và cập nhật documentation cần thiết.
