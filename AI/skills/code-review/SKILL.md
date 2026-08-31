---
name: code-review
description: Hướng dẫn review code theo checklist và phân loại mức độ. Use when reviewing code, PRs, hoặc được yêu cầu code review.
---

# Code Review

## Kiểm tra

- correctness
- architecture
- readability
- maintainability
- error handling
- security
- performance
- testing
- dependency usage
- documentation

## Output

Chỉ đưa ra danh sách Issues; KHÔNG sửa code trực tiếp dù issue rõ ràng hay dễ sửa. Kết quả review là danh sách Issue, mọi thay đổi code là task riêng (do người dùng yêu cầu sau khi xem review).

Phân loại:

### Critical

Phải sửa.

### Important

Nên sửa.

### Suggestion

Có thể cải thiện.

### Good

Điểm triển khai tốt.

Không tự sửa code khi task chỉ yêu cầu review.
