# Plan Management

## Trigger

Quản lý vòng đời plan: tạo, lưu, chuyển active → completed.

## Rules

| State | Task | Action |
|-------|------|--------|
| Planning | Create plan | Lưu vào `AI/plans/active/<name>.md` |
| Build | Edit plan | **Chỉ sửa** `AI/plans/active/` |
| Done | Complete plan | Gọi `move-plan-to-completed.bat <name>` |

## Script

`move-plan-to-completed.bat <plan-name>` - move file (không copy, tiết kiệm token).

Agent **BẮT BUỌC** tuân thủ 3 rules trên.