# Problem Engine {#problem-engine}

## Giới thiệu {#gioi-thieu}

`packages/problem-engine` cung cấp `ProblemEngine` — class quản lý **in-memory problem registry** và **test runner**. Đây là nguồn dữ liệu chính cho API server.

## Thành phần {#thanh-phan}

- `ProblemEngine` — registry (Map) + test runner.
- `engine` — singleton instance.
- `register(problem)` — đăng ký problem; gọi `problemDb.add` fire-and-forget để ghi SQLite.

## Phương thức {#phuong-thuc}

| Phương thức | Mô tả |
|-------------|-------|
| `get(id)` | Lấy problem theo id |
| `getRandom(difficulty?)` | Lấy random problem, có thể lọc theo difficulty |
| `runTests(id, solution)` | Chạy test cases, trả `{ passed, total }` |
| `runTestsDetailed(id, solution)` | Chạy từng test case, trả `{ passed, total, results }` với `results: { input, expected, actual, ok, error }[]` |

## Các kiểu dữ liệu {#cac-kieu-du-lieu}

- `TestCaseResult`: `{ input: unknown; expected: unknown; actual: unknown; ok: boolean; error?: string }`

## Dependency {#dependency}

```text
@leetcode/problem-engine ──> @leetcode/shared, @leetcode/database
```

## Ghi chú {#ghi-chu}

- Dùng `new Function("return " + code)` để tạo solution — đây là thiết kế có chủ đích.
- Server đọc từ registry này, không đọc SQLite.