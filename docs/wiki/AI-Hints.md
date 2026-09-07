# AI Hints {#ai-hints}

## Tổng quan

`packages/ai` — Cung cấp hàm hint và giải thích cho problems. Hiện tại chỉ là **placeholder**, **chưa kết nối với LLM API thật**.

- Dùng bởi `apps/server` (`POST /api/problems/:id/hint`)
- Export qua `src/index.ts`

## Exports

```typescript
// packages/ai/src/index.ts

interface AIHint {
  type: "approach" | "optimization" | "edge-case";
  message: string;
}

interface AIResponse {
  hints: AIHint[];
  explanation: string;
  complexity: { time: string; space: string };
}

// Placeholder implementation
export async function getHint(problemId: number, userCode: string): Promise<AIResponse> {
  // TODO: tích hợp LLM thật
  return {
    hints: [
      { type: "approach", message: "Thử dùng two-pointer hoặc hash map" },
      { type: "optimization", message: "Có thể tối ưu space xuống O(1)" },
      { type: "edge-case", message: "Xử lý trường hợp mảng rỗng" },
    ],
    explanation: "Đây là placeholder explanation. Chưa gọi LLM thật.",
    complexity: { time: "O(n)", space: "O(1)" },
  };
}

export async function explainSolution(problemId: number, solution: string): Promise<string> {
  return "Placeholder explanation for solution.";
}
```

## Types (định nghĩa trong `@leetcode/shared`)

```typescript
// @leetcode/shared
type AIHintType = "approach" | "optimization" | "edge-case";
interface AIHint { type: AIHintType; message: string; }
interface AIResponse {
  hints: AIHint[];
  explanation: string;
  complexity: { time: string; space: string };
}
```

## Usage trong Server

```typescript
// apps/server/src/controllers/problem.controller.ts
import { getHint } from "@leetcode/ai";

export async function hintController(req, reply) {
  const { id } = req.params;
  const { code } = req.body;
  const response = await getHint(Number(id), code);
  return reply.send(response);
}
```

Route: `POST /api/problems/:id/hint` → `{ code: string }` body → `AIResponse`

## Dependency

```
@leetcode/ai ──▶ @leetcode/shared
```

## Build & Test

```bash
pnpm --filter=@leetcode/ai build   # tsc --noEmit
pnpm --filter=@leetcode/ai test    # Vitest (6 tests placeholder)
pnpm --filter=@leetcode/ai lint    # ESLint
```

## Ghi chú

- **Chưa gọi LLM API** (OpenAI, Anthropic, Vercel AI SDK, etc.)
- Theo README plan: tích hợp AI hint streaming với Vercel AI SDK
- Web panel AI dùng WebSocket `/ws/ai` → server `packages/ai` `generateGuide` (placeholder) → trả JSON `AIGuide` 5 section
- Panel AI có nút "Giải thích (AI)" hiện explanation cục bộ + "ChatGPT ↗" mở chatgpt.com với prompt điền sẵn
- AI cục bộ nhỏ khó giải thích bài lớn → fallback sang ChatGPT