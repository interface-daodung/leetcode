# Problem Engine {#problem-engine}

## Giới thiệu {#gioi-thieu}

`packages/problem-engine` cung cấp `ProblemEngine` — class quản lý **in-memory problem registry** và **test runner**, kèm `ProblemTreeState` (state/tree model) cho tra cứu linh hoạt.

## Thành phần {#thanh-phan}

- `ProblemEngine` — registry (Map) + test runner + `ProblemTreeState`.
- `engine` — singleton instance.
- `register(problem)` — đăng ký problem; gọi `problemDb.add` fire-and-forget để ghi SQLite; đồng thời cập nhật `ProblemTreeState` (byDifficulty, byTag, byId).
- `ProblemTreeState` — pure state tree: `byDifficulty` (`Record<Difficulty, ProblemNode[]>`), `byTag` (`Map<string, ProblemNode[]>`), `byId` (`Map<number, ProblemNode>`).

## Phương thức {#phuong-thuc}

| Phương thức | Mô tả |
|-------------|-------|
| `get(id)` | Lấy problem theo id |
| `getRandom(difficulty?)` | Lấy random problem, có thể lọc theo difficulty |
| `runTests(id, solution)` | Chạy test cases, trả `{ passed, total }` |
| `runTestsDetailed(id, solution)` | Chạy từng test case, trả `{ passed, total, results }` với `results: { input, expected, actual, ok, error }[]` |
| `search(params)` | Tìm kiếm + lọc (query/difficulty) — dùng `ProblemTreeState` |
| `getTags()` | Danh sách tags đang có |
| `listByDifficulty(difficulty?)` | List problems theo difficulty |
| `findMeta(id)` | Tra cứu meta qua tree |
| `remove(id)` | Xóa problem khỏi engine + tree |

## Các kiểu dữ liệu {#cac-kieu-du-lieu}

- `TestCaseResult`: `{ input: unknown; expected: unknown; actual: unknown; ok: boolean; error?: string }`

## Dependency {#dependency}

```text
@leetcode/problem-engine ──> @leetcode/shared, @leetcode/database
```

## Ghi chú {#ghi-chu}

- Dùng `new Function("return " + code)` để tạo solution — đây là thiết kế có chủ đích.
- Server đọc từ registry này, không đọc SQLite.