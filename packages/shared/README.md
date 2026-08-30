# @leetcode/shared

Types, utilities, constants dùng chung cho toàn bộ monorepo.

## Nội dung

- `Difficulty` — `"easy" | "medium" | "hard"`
- `ProblemMeta` — metadata problem (id, title, difficulty, tags, ...)
- `TestCase` — `{ input: unknown; expected: unknown }`
- `AIHint` — `{ type: "approach" | "optimization" | "edge-case"; message: string }`
- `AIResponse` — `{ hints: AIHint[]; explanation: string; complexity: { time: string; space: string } }`
- `EditorState` — `{ code: string; language: string; problemId?: number }`
- `formatProblemId` — format id dạng `LC0001`

## Dependency

Không phụ thuộc package nội bộ nào. Được dùng bởi tất cả apps và packages.