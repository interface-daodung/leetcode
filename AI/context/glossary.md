# Glossary

| Term | Meaning |
|------|---------|
| `@leetcode/*` | Workspace alias cho packages nội bộ trong monorepo |
| `ProblemMeta` | Type định nghĩa metadata của problem (id, title, difficulty, tags, ...) |
| `ProblemEngine` | Class quản lý in-memory problem registry và test runner |
| `ProblemDatabase` | Class CRUD cho SQLite via Drizzle ORM |
| `Difficulty` | Union type: `"easy" | "medium" | "hard"` |
| `TestCase` | Type `{ input: unknown; expected: unknown }` |
| `EditorState` | Type `{ code: string; language: string; problemId?: number }` |
| `formatProblemId` | Util function: `LC0001` format |
| `AIHint` | Type `{ type: "approach" | "optimization" | "edge-case"; message: string }` |
| `AIResponse` | Type `{ hints: AIHint[]; explanation: string; complexity: { time: string; space: string } }` |