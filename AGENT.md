# Agent Instructions

## Mục đích

File này chứa các nguyên tắc làm việc cấp repository dành cho AI Agent.

## Bắt đầu công việc

Trước khi thực hiện task:

1. Đọc `AI/INDEX.md`.
2. Đọc `AI/STATUS.md`.
3. Đọc `AI/CONVENTIONS.md`.
4. Xác định module liên quan.
5. Đọc documentation liên quan trong `AI/index/` và `AI/walkthrough/`.

Không đọc toàn bộ repository nếu không cần thiết.

## Project Knowledge

Documentation cấp project nằm trong:

`AI/`

Điểm bắt đầu:

`AI/INDEX.md`

## Development Rules

- Không tự commit.
- Không tự merge.
- Không tự push nếu chưa được yêu cầu.
- Không xóa dữ liệu hoặc file không liên quan.
- Không sửa file ngoài phạm vi task nếu không có lý do.
- Ưu tiên dependency và abstraction hiện có.
- Không phát minh lại chức năng mà thư viện hiện tại đã cung cấp.
- Không tạo abstraction không cần thiết.
- Comment code chỉ khi comment mang lại thông tin hữu ích.
- Documentation sử dụng tiếng Việt.
- Comment code sử dụng tiếng Việt khi cần giải thích logic.

## Documentation Synchronization

Sau khi thay đổi code:

- Cập nhật `AI/index/` nếu cấu trúc thay đổi.
- Cập nhật `AI/ARCHITECTURE.md` nếu architecture thay đổi.
- Cập nhật `AI/walkthrough/` nếu execution flow thay đổi.
- Cập nhật `AI/context/decisions.md` nếu có technical decision.
- Cập nhật `AI/context/known-issues.md` nếu phát hiện issue.
- Ghi lại thay đổi quan trọng trong `AI/history/`.

## Source of Truth

Source code là nguồn sự thật về implementation.

Nếu `AI/` mâu thuẫn với source code:

`Source code > AI documentation`

Agent phải cập nhật documentation thay vì sửa code chỉ để khớp tài liệu.
