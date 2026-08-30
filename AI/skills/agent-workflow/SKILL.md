# Agent Workflow

## Mục tiêu

Đảm bảo Agent:

- hiểu project trước khi sửa
- chỉ đọc source cần thiết
- sử dụng dependency hiện có
- lập plan cho feature lớn
- ghi lại thay đổi
- duy trì documentation

---

## 1. Start

Đọc:

`AI/INDEX.md`

Sau đó đọc:

- `AI/STATUS.md`
- `AI/CONVENTIONS.md`

---

## 2. Locate

Sử dụng:

`AI/index/`

để xác định source liên quan.

---

## 3. Understand

Nếu module phức tạp:

Đọc walkthrough tương ứng.

---

## 4. Inspect Dependencies

Kiểm tra dependency hiện có trước khi triển khai.

Không tự viết lại functionality đã có trong dependency phù hợp.

---

## 5. Classify Task

### Small

Ví dụ:

- typo
- simple bug
- small refactor

### Large

Ví dụ:

- feature
- architecture change
- database change
- API contract change
- execution system change

Feature lớn cần plan và branch.

---

## 6. Plan

Tạo:

`AI/plans/active/<feature>.md`

---

## 7. Git

Feature lớn:

- kiểm tra status
- kiểm tra branch
- tạo feature branch

Không tự commit.

Không tự merge.

Không tự push nếu chưa được yêu cầu.

---

## 8. Implement

Tuân thủ:

`AI/CONVENTIONS.md`

Chỉ sửa phạm vi cần thiết.

---

## 9. Test

Chạy:

- formatter
- lint
- typecheck
- unit test
- integration test
- runtime verification

tùy theo project thực tế.

Không chạy command không tồn tại.

---

## 10. Document

Nếu thay đổi architecture:

`AI/ARCHITECTURE.md`

Nếu thay đổi structure:

`AI/index/`

Nếu thay đổi flow:

`AI/walkthrough/`

Nếu có decision:

`AI/context/decisions.md`

Nếu có issue:

`AI/context/known-issues.md`

---

## 11. History

Thay đổi quan trọng phải được ghi vào:

`AI/history/YYYY-MM/`

---

## 12. Finish

Báo cáo:

- branch
- files changed
- tests
- documentation updated
- issues
- next step

Không tự commit hoặc merge.
