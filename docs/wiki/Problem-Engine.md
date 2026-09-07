# Problem Engine {#problem-engine}

## Tổng quan

`packages/problem-engine` — Cung cấp `ProblemEngine` class quản lý **in-memory problem registry** và **test runner**, kèm `ProblemTreeState` (state/tree model) cho tra cứu linh hoạt.

- Singleton instance: `engine` (export từ `src/index.ts`)
- Dùng bởi `apps/server` và `apps/web`

## Thành phần

| Class/Export | Mô tả |
|--------------|-------|
| `ProblemEngine` | Registry (Map) + test runner + `ProblemTreeState` |
| `engine` | Singleton instance |
| `ProblemTreeState` | Pure state tree: `byDifficulty`, `byTag`, `byId` |
| `register(problem)` | Đăng ký problem; gọi `problemDb.add` fire-and-forget; cập nhật tree |

## ProblemTreeState

```typescript
interface ProblemTreeState {
  byDifficulty: Record<Difficulty, ProblemNode[]>;
  byTag: Map<string, ProblemNode[]>;
  byId: Map<number, ProblemNode>;
}
```

- `ProblemNode`: `{ id, title, difficulty, tags }` — lightweight meta cho search/filter
- Cập nhật tự động khi `register()` / `remove()`

## Phương thức ProblemEngine

| Phương thức | Mô tả |
|-------------|-------|
| `get(id)` | Lấy problem theo id |
| `getRandom(difficulty?)` | Random problem, optional filter difficulty |
| `runTests(id, solution)` | Chạy test cases → `{ passed, total }` |
| `runTestsDetailed(id, solution)` | Chạy từng test case → `{ passed, total, results[] }` |
| `search(params)` | Tìm kiếm + lọc (query/difficulty) — dùng tree |
| `getTags()` | Danh sách tags đang có |
| `listByDifficulty(difficulty?)` | List problems theo difficulty |
| `findMeta(id)` | Tra cứu meta qua tree |
| `remove(id)` | Xóa problem khỏi engine + tree |

## Kết quả Run

```typescript
interface TestCaseResult {
  input: unknown;
  expected: unknown;
  actual: unknown;
  ok: boolean;
  error?: string;
}
```

- `runTests`: trả `{ passed, total }`
- `runTestsDetailed`: trả `{ passed, total, results: TestCaseResult[] }`

## Solution Execution

```typescript
// Trong engine.runTestsDetailed
const solutionFn = new Function("return " + solutionCode)();
// Gọi solutionFn với spread input
const actual = solutionFn(...input);
```

> ⚠️ Dùng `new Function("return " + code)` — **thiết kế có chủ đích**, không phải bug. Cho phép chạy function declaration/expression/arrow.

## Dependency

```
@leetcode/problem-engine ──▶ @leetcode/shared, @leetcode/database
```

- Import `problemDb` từ `@leetcode/database` để `add` fire-and-forget
- Không import server/web

## Usage trong Server

```typescript
// apps/server/src/services/problem.service.ts
import { engine } from "@leetcode/problem-engine";

export const problemService = {
  getById: (id) => engine.get(id),
  run: (id, code) => engine.runTestsDetailed(id, solution),
  // ...
};
```

## Hydrate từ DB

Khởi động server (`apps/server/src/index.ts`):

```typescript
const problems = await problemDb.getAllWithHints();
for (const p of problems) {
  engine.register(p);  // problemDb.add fire-and-forget bên trong
}
```

## Build & Test

```bash
pnpm --filter=@leetcode/problem-engine build   # tsc --noEmit (type-check)
pnpm --filter=@leetcode/problem-engine test    # Vitest (10 tests)
pnpm --filter=@leetcode/problem-engine lint    # ESLint
```

## Ghi chú

- Server đọc từ registry này, **KHÔNG** đọc SQLite trực tiếp
- `problemDb.add` là void (fire-and-forget) — không await
- State/tree model tách biệt để web dùng cho Explorer panel search/filter