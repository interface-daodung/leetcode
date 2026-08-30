# AI Hints {#ai-hints}

## Giới thiệu {#gioi-thieu}

`packages/ai` cung cấp hàm hint và giải thích cho problems. Hiện tại chỉ là **placeholder**, chưa kết nối với LLM API thật.

## Thành phần {#thanh-phan}

- `getHint(problemId, userCode)` — trả object `{ hints, explanation, complexity }`.
- `explainSolution(problemId, solution)` — trả string.
- Types: `AIHint`, `AIResponse` (định nghĩa trong `packages/shared`).

## Types {#types}

```text
AIHint     { type: "approach" | "optimization" | "edge-case"; message: string }
AIResponse { hints: AIHint[]; explanation: string;
             complexity: { time: string; space: string } }
```

## Usage {#usage}

```text
apps/server
  └─ POST /api/problems/:id/hint → ai.getHint(problemId, userCode)
```

## Ghi chú {#ghi-chu}

- Chưa gọi LLM API.
- Theo README plan: tích hợp AI hint streaming với Vercel AI SDK.