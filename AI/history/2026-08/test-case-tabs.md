# Khung tabs test case dưới code editor

Ngày: 2026-08-31
Nhánh: `feat/frontend-vscode-open`

## Bối cảnh

Sau khi Run code, chỉ hiển thị `passed/total` — người dùng không thấy được từng test case đầu vào/đầu ra thế nào để debug.

## Thay đổi

### problem-engine (`packages/problem-engine/src/index.ts`)

- Thêm `runTestsDetailed(problemId, solution)` — chạy từng test case, bắt lỗi riêng, trả `{ passed, total, results }`.
- Thêm interface `TestCaseResult` (`{ input, expected, actual, ok, error? }`).

### Server (`apps/server`)

- `problem.service.run` đổi sang dùng `runTestsDetailed`, `RunOutcome` thêm `results: TestCaseResult[]`.
- Controller trả `{ passed, total, problemId, results }`.

### Web (`apps/web`)

- `lib/api.ts`: `runCode` trả thêm `results[]`, thêm type `TestCaseResultView`.
- `components/TestCaseTabs.tsx` (mới): tabs từng test case — mỗi tab có chấm xanh/đỏ theo `ok`, hiển thị 3 cột **Input / Expected / Actual**, badge tổng `passed/total`, khối lỗi nếu case ném exception.
- `ProblemDetail`: lưu `results` sau khi Run, render `TestCaseTabs` dưới `CodeEditor`.

## Kết quả

- `pnpm -r build` pass.
- Server 36 tests, extension 49 tests pass.
- `POST /api/problems/1/run` trả `results` với từng case: `{"passed":3,"total":3,"problemId":"LC0001","results":[{input, expected, actual, ok}, ...]}`.
