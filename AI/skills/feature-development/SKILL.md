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
7. Tạo plan (xem Plan Management).
8. Tạo branch.
9. Implement.
10. Test.
11. Update documentation.
12. Ghi history.
13. Hoàn thành plan (xem Plan Management).

## Plan Management

| State | Task | Action |
|-------|------|--------|
| Planning | Create plan | Lưu vào `AI/plans/active/<name>.md` |
| Build | Edit plan | **Chỉ sửa** `AI/plans/active/` |
| Done | Complete plan | Chạy `AI\skills\feature-development\move-plan-to-completed.bat <name>` |

- Script move file (không copy, tiết kiệm token). Chạy từ **repo root** vì dùng đường dẫn tương đối `AI\plans\...`.
- Không coi feature hoàn thành nếu chưa test và cập nhật documentation cần thiết.
