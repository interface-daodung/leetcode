# @leetcode/problem-engine

In-memory problem registry + test runner cho LeetCode Lab.

## Nội dung

- `ProblemEngine` — registry (Map) + test runner
- `engine` — singleton instance
- `register(problem)` — đăng ký problem; ghi SQLite fire-and-forget
- `get(id)` — lấy problem theo id
- `getRandom(difficulty?)` — random problem theo difficulty (optional)
- `runTests(id, solution)` — chạy test cases, trả `{ passed, total }`

## Dependency

- `@leetcode/shared`, `@leetcode/database`

## Tài liệu

- [Problem Engine](../../docs/features/problem-engine.md)

## Ghi chú

- Nguồn dữ liệu chính cho API server.
- Dùng `new Function("return " + code)` để tạo solution — thiết kế có chủ đích.