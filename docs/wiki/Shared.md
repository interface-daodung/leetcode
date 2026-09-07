# Shared {#shared}

## Tổng quan

`packages/shared` — Types, utilities, constants dùng chung bởi tất cả apps/packages. **Luật phân tầng #2**: model/entity dùng chung đặt ở đây để server và client không lệch tên trường, không khai báo trùng.

- Package chỉ export qua `src/index.ts`
- Import qua alias `@leetcode/shared`

## Exports Chính

### Types

```typescript
// Problem
type Difficulty = "easy" | "medium" | "hard";

interface ProblemMeta {
  id: number;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  template?: string;
  url?: string;
  slug?: string;
  testCases: TestCase[];
  createdAt: string;
}

interface ProblemClip extends ProblemMeta {
  hints?: string[];
  clippedAt: string;
}

type TestCase = { input: unknown; expected: unknown };

// AI
type AIHintType = "approach" | "optimization" | "edge-case";
interface AIHint { type: AIHintType; message: string; }
interface AIResponse {
  hints: AIHint[];
  explanation: string;
  complexity: { time: string; space: string };
}

// Editor
interface EditorState {
  code: string;
  language: string;
  problemId?: number;
}
```

### Utilities

| Function | Mô tả |
|----------|-------|
| `formatProblemId(id: number)` | Format `LC0001`, `LC0123`, `LC1234` |
| `sanitizeHtml(html: string)` | Sanitize HTML (DOMParser, allowlist tags/attrs) |
| `sanitizeFilename(name: string)` | Safe filename (loại bỏ ký tự đặc biệt) |
| `sleep(ms)` | Promise delay |
| `retry(fn, retries, delay)` | Retry logic với exponential backoff |

### Constants

```typescript
const DIFFICULTY_ORDER: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };
const DIFFICULTY_COLORS: Record<Difficulty, string> = { easy: "green", medium: "yellow", hard: "red" };
const TAG_CATEGORIES = ["array", "string", "tree", "graph", "dp", "binary-search", ...];
```

### Assets

```
packages/shared/asset/icon/
  leetcodeLab.ico
  leetcodeLab.png
  leetcodeLab.webp
```

- Nguồn dùng chung, copy vào `apps/web/public/assets/` và `apps/extension/assets/`
- **Không thêm logic/helper TS** — chỉ đặt file ảnh

## Dependency

```
@leetcode/shared ──▶ (none, pure TS)
```

- Không phụ thuộc package nội bộ khác
- Không phụ thuộc framework (React, Fastify, etc.)

## Usage

```typescript
// Server
import { ProblemMeta, formatProblemId } from "@leetcode/shared";

// Web
import { ProblemClip, sanitizeHtml } from "@leetcode/shared";

// Extension (copy type, không phụ thuộc workspace build)
interface ProblemClip { ... }  // copy từ shared
```

## Build & Test

```bash
pnpm --filter=@leetcode/shared build   # tsc --noEmit
pnpm --filter=@leetcode/shared test    # Vitest (chưa có test)
pnpm --filter=@leetcode/shared lint    # ESLint (lỗi sẵn: thiếu eslint.config.*)
```

## Ghi chú

- Mọi type/entity dùng chung **bắt buộc** định nghĩa ở đây
- Khi thêm field mới cho problem: cập nhật `ProblemMeta`/`ProblemClip` ở đây → tự động đồng bộ server/web/extension
- Extension copy type definition thủ công (không build từ workspace)