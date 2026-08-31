---
name: bug-fix
description: Hướng dẫn sửa bug đúng quy trình. Use when debugging, fixing bugs, hoặc khi có lỗi cần trace root cause.
---

# Bug Fix

## Trigger

Sử dụng khi debug, sửa bug, hoặc khi `AI/context/known-issues.md` còn issue trong `Current Issues`.

## Workflow

### Phase 0 — Đồng bộ Known Issues → Backlog (bắt buộc)

1. Đọc `AI/INDEX.md`, `AI/STATUS.md`, `AI/CONVENTIONS.md` (theo AGENTS.md).
2. Đọc `AI/context/known-issues.md` — liệt kê toàn bộ `Current Issues`.
3. Với mỗi issue chưa có file tương ứng trong `AI/plans/backlog/`, tạo **một file backlog riêng** (1 issue = 1 file, không gộp):
   - Tên file: `kebab-case` theo slug của issue (ví dụ `fix-created-at-default.md`).
   - Nội dung: tiêu đề, file liên quan (`packages/...:line`), mô tả, ảnh hưởng, nguyên nhân, expected/actual, tiêu chí hoàn thành, ghi chú `Source: AI/context/known-issues.md#<n>`.
   - Đặt vào `AI/plans/backlog/<name>.md` — không tạo ở `active`, không chép sang chỗ khác.
4. Nếu `AI/plans/backlog/` đã có file mà `known-issues.md` không còn issue tương ứng → giữ nguyên để xử lý, hoặc đánh dấu trong file.

### Phase 1 — Sửa lần lượt từng backlog (tuần tự, không song song)

Lặp cho đến khi `AI/plans/backlog/` rỗng (chỉ còn `.gitkeep`):

1. Chọn **một backlog duy nhất** theo thứ tự ưu tiên: số thứ tự trong `known-issues.md` tăng dần (hoặc `critical` trước nếu có nhãn).
2. Gọi backlog đó — thực hiện quy trình sửa bug cổ điển trên **duy nhất backlog đang chọn**:
   1. Reproduce bug (viết script/test tái hiện).
   2. Xác định expected behavior.
   3. Xác định actual behavior.
   4. Trace execution flow.
   5. Xác định root cause (đối chiếu với `Nguyên nhân` trong known-issues/backlog).
   6. Sửa **nguyên nhân** thay vì chỉ che triệu chứng — chỉ sửa file liên quan, không sửa ngẫu nhiên nhiều file.
   7. Test regression (Vitest `vitest run` hoặc test thủ công liên quan).
    8. Cập nhật documentation nếu cần (ghi `AI/context/decisions.md` hoặc `AI/history/` — kiến trúc/codebase dùng GitNexus, `AI/index/`, `AI/ARCHITECTURE.md` đã archive).
   9. Ghi history nếu thay đổi đáng kể (`AI/history/`).
3. Khi backlog đạt Definition of Done:
   - Chạy **`AI\skills\bug-fix\move-backlog-to-completed.bat <name>`** từ **repo root** để **move** (không copy) file `AI/plans/backlog/<name>.md` → `AI/plans/completed/<name>.md`.
   - Cập nhật `AI/context/known-issues.md`: chuyển issue tương ứng từ `Current Issues` sang `Resolved Issues` (ghi ngày resolve, link tới file completed).
4. Quay lại bước 1 — chọn backlog tiếp theo. Không mở song song nhiều backlog để tránh conflict và tốn token.

### Phase 2 — Hoàn tất

- Khi `AI/plans/backlog/` rỗng: xác nhận `AI/context/known-issues.md` không còn `Current Issues` (hoặc chỉ còn issue `wontfix` có lý do).
- Cập nhật `AI/STATUS.md` nếu có thay đổi đáng kể.

## Plan Management (Backlog)

| State | Vị trí | Action | Lưu ý token |
|-------|--------|--------|-------------|
| Backlog | `AI/plans/backlog/<name>.md` | Tạo 1 file / 1 issue từ `known-issues.md` | Không chép nội dung sang `active` hay nơi khác |
| Doing | `AI/plans/backlog/<name>.md` | Chỉ sửa file backlog đang làm | Không duplicate sang file khác |
| Done | `AI/plans/completed/<name>.md` | Chạy `AI\skills\bug-fix\move-backlog-to-completed.bat <name>` từ repo root | Dùng `move` (không `copy`) — tiết kiệm token, tránh chép sang trang khác |

- Script move dùng đường dẫn tương đối `AI\plans\...` nên phải chạy từ **repo root**.
- Tuyệt đối **không dùng `copy`/`cp`/`Copy-Item`** để hoàn thành backlog — chỉ `move` để tránh tốn token do chép nội dung sang trang khác.
- Không tạo backlog trong `AI/plans/active/` — `active` dành cho `feature-development`.

## Không được

- sửa ngẫu nhiên nhiều file
- disable validation để che bug
- xóa test để làm test pass
- thay đổi behavior không liên quan
- gộp nhiều issue vào một backlog
- copy backlog sang `completed` bằng `copy` (phải `move`)
- sửa song song nhiều backlog cùng lúc
- chép nội dung backlog sang trang/file khác để “backup” (tốn token) — lịch sử đã có trong `completed` và `known-issues.md`
