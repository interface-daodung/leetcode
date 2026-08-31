---
name: context-cleanup
description: Dọn dẹp `AI/context` và `AI/STATUS.md` khi chúng phình to vì lịch sử thay đổi/bug đã fix. Use when được yêu cầu làm sạch knowledge base, chuẩn bị phase mới, hoặc khi STATUS/known-issues quá dài gây tốn token.
---

# Context Cleanup Skill

## Purpose

Giữ cho `AI/` luôn "tươi" để Agent mới không bị rối và không tốn token đọc lại toàn bộ lịch sử. Mục tiêu: `STATUS.md` và `AI/context/` chỉ phản ánh **trạng thái hiện tại**, còn chi tiết lịch sử nằm gọn trong `AI/history/` và `AI/plans/completed/`.

## When to Use

- Người dùng yêu cầu dọn dẹp `AI/`.
- `AI/STATUS.md` có nhiều mục `[mới] ...` chi tiết kể lại từng thay đổi/bug đã fix.
- `AI/context/known-issues.md` có danh sách `Resolved Issues` dài với nội dung "cách fix" chi tiết.
- Bắt đầu một phase lớn mới và muốn Agent mới nhìn thấy bức tranh gọn gàng.

## Workflow

### Phase 0 — Pre-flight

1. Đọc `AI/INDEX.md`, `AI/STATUS.md`, `AI/CONVENTIONS.md` (theo AGENTS.md).
2. Dùng GitNexus (`query`/`context`) để nắm "source of truth" hiện tại — không dọn nhầm. (`AI/ARCHITECTURE.md` đã archive sang `history/archived/`.)

### Phase 1 — Đánh giá độ phình

1. Đếm dòng các file: `AI/STATUS.md`, `AI/context/known-issues.md`, `AI/context/decisions.md`, `AI/context/glossary.md`.
2. Phân loại từng phần:
   - **Trạng thái hiện tại**: phase đang làm, việc đang làm, bước kế tiếp, quyết định kiến trúc còn hiệu lực, issue chưa fix.
   - **Lịch sử**: changelog từng mở rộng, mô tả bug đã fix kèm cách fix, plan cũ, quyết định đã thay thế.

### Phase 2 — Lưu trữ lịch sử

1. Với phần **lịch sử** chưa có file trong `AI/history/YYYY-MM/`, tạo file history tóm tắt (theo convention `AI/history/YYYY-MM/<slug>.md`).
2. Tạo một mục history ghi lại chính lần dọn dẹp này (ngày, đã cắt gì, còn giữ gì).
3. Sau khi đã có history, phần lịch sử trong `STATUS.md`/`known-issues.md` chỉ nên là **link trỏ** vào history, không chép lại nội dung.

### Phase 3 — Viết lại `AI/STATUS.md`

- **Giữ lại**:
  - `## Current Phase`: 1 đoạn ngắn mô tả phase đang làm.
  - `## Đã hoàn thành`: gộp nhóm, mỗi nhóm 1 dòng ngắn, không kể chi tiết implement (vd: "DB 3 bảng + assets/hints — chi tiết xem `AI/history/2026-08/...`").
  - `## Đang làm` và `## Tiếp theo`: chỉ còn các mục thực sự còn hiệu lực.
- **Bỏ đi**: các bullet `[mới]` chi tiết kể lại từng bước mở rộng cũ, thông tin trùng với history, kết quả verify 1 lần rồi thôi.

### Phase 4 — Dọn `AI/context/known-issues.md`

- `Current Issues`: chỉ giữ issue **chưa fix** và còn giá trị theo dõi.
- `Resolved Issues`:
  - Ưu tiên **xóa hẳn nội dung** đã fix (chi tiết đã nằm trong `AI/plans/completed/` và history).
  - Nếu muốn giữ vết, chỉ để 1 dòng: `- [x] <tên issue> — resolved YYYY-MM-DD, xem AI/plans/completed/<name>.md`.
- **Không được** xóa `decisions.md` (quyết định kiến trúc) và `glossary.md` (thuật ngữ) — đây là tri thức nền cần giữ nguyên; chỉ bỏ phần transient nếu có.

### Phase 5 — Đồng bộ `AI/INDEX.md`

- Nếu cấu trúc thay đổi (vd thêm folder archive, đổi tên file), cập nhật `AI/INDEX.md` nếu cần.

### Phase 6 — Kiểm tra (Verify)

1. Mọi link tương đối trong các file vừa sửa vẫn trỏ đúng (dùng `Test-Path` hoặc đọc thử).
2. Không mất tri thức nền: `decisions.md`, `glossary.md`, `history/archived/ARCHITECTURE.md` còn nguyên nội dung quan trọng.
3. `git status` chỉ show đúng các file thuộc phạm vi dọn dẹp, không có file tạm.
4. Báo cáo ngắn cho user: đã cắt bao nhiêu dòng, chuyển gì sang history, tiết kiệm được gì.

## Không được

- xóa nội dung `decisions.md`, `glossary.md`, `history/archived/ARCHITECTURE.md` trừ khi chắc chắn là rác/hết hiệu lực.
- xóa `AI/plans/completed/*` (đó là archive chính thức).
- xóa thông tin lý do ("tại sao") — phải chuyển sang history trước khi xoá ở nơi khác.
- sửa code để khớp tài liệu sau khi dọn — nếu source và doc mâu thuẫn, ưu tiên source rồi mới cập nhật doc.
- làm sạch quá tay khiến Agent mới mất ngữ cảnh về kiến trúc/quyết định hiện hành.
