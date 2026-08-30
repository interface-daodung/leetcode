# AI Walkthrough

> Tài liệu này sẽ được bổ sung dựa trên implementation thực tế.

## Overview

Package `@leetcode/ai` cung cấp các hàm hint và giải thích cho problems. Hiện tại chỉ là placeholder, chưa kết nối với LLM API thật.

## Flow

```text
@leetcode/ai/src/index.ts
  ├─ getHint(problemId, userCode)
  │    └─ trả object { hints: [...], explanation, complexity }
  └─ explainSolution(problemId, solution)
       └─ trả string

Được dùng bởi:
  └─ apps/server: POST /api/problems/:id/hint → ai.getHint
```

## Important Components

- `packages/ai/src/index.ts` — toàn bộ code AI package.
- `AIHint` type — `{ type: "approach" | "optimization" | "edge-case", message: string }`.
- `AIResponse` type — `{ hints: AIHint[], explanation, complexity }`.

## Entry Points

- `packages/ai/src/index.ts` (export `getHint`, `explainSolution`)

## Related Files

- `apps/server/src/index.ts` — route `/api/problems/:id/hint` gọi `getHint`.

## Notes

- Hiện là placeholder, chưa gọi LLM API.
- Cần tích hợp Vercel AI SDK hoặc API tương tự theo README plan.