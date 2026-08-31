# AI Project Knowledge Base

Thư mục này chứa kiến thức, hướng dẫn và lịch sử dành cho AI Agent làm việc với repository.

## Mục đích

`AI/` có hai nhiệm vụ:

1. Hướng dẫn Agent làm việc đúng với project.
2. Lưu lại kiến thức và lịch sử phát triển của project.

## Cấu trúc

- `INDEX.md`: Điểm bắt đầu cho Agent.
- `PROJECT.md`: Mục tiêu và phạm vi project.
- `CONVENTIONS.md`: Quy ước code.
- `STATUS.md`: Trạng thái hiện tại.

- `plans/`: Kế hoạch phát triển.
- `skills/`: Quy trình làm việc của Agent.
- `history/`: Lịch sử phát triển (gồm `archived/` chứa `index/`, `ARCHITECTURE.md`, `walkthrough/` đã ngưng dùng).
- `context/`: Decision, issue và glossary.

## Hiểu codebase

Dùng **GitNexus** (`query`, `context`, `impact`) thay vì đọc các file archive trong `history/archived/` (`index/`, `ARCHITECTURE.md`, `walkthrough/`). GitNexus tự động biết cấu trúc source, import, dependency, cluster và execution flow — luôn đồng bộ với source code, không cần cập nhật tay.

## Nguyên tắc

Agent không được đọc toàn bộ repository nếu không cần thiết.

Agent phải bắt đầu từ `INDEX.md`, xác định khu vực liên quan rồi mới đọc source code cần thiết.
