# Package Structure

## Packages

Monorepo chứa 6 package nội bộ (`packages/*`):

| Package | Alias | Mô tả |
|---------|-------|-------|
| `shared` | `@leetcode/shared` | Types (`Difficulty`, `ProblemMeta`, `ProblemClip`, `TestCase`), util (`formatProblemId`) |
| `database` | `@leetcode/database` | Drizzle ORM + SQLite, `ProblemDatabase` class |
| `editor` | `@leetcode/editor` | `EditorState`, `createEditorState`, `languageTemplates` |
| `javascript-docs` | `@leetcode/javascript-docs` | Static JS/TS reference docs, `getDoc` |
| `problem-engine` | `@leetcode/problem-engine` | `ProblemEngine` registry (in-memory) + test runner |
| `ai` | `@leetcode/ai` | `getHint`, `explainSolution` (placeholder) |

## Dependencies

### Root

- `packageManager: pnpm@11.24.0`
- `engines.node: >=20`

### External Dependencies

| Package | Dùng bởi |
|---------|-----------|
| `fastify@^4.28.0` | `@leetcode/server` |
| `zod@^3.23.0` | `@leetcode/server` |
| `react@^18.3.0` | `@leetcode/web` |
| `react-dom@^18.3.0` | `@leetcode/web` |
| `@vitejs/plugin-react@^4.3.0` | `@leetcode/web` (dev) |
| `vite@^5.4.0` | `@leetcode/web` (dev) |
| `drizzle-orm@^0.45.2` | `@leetcode/database` |
| `@libsql/client@^0.17.4` | `@leetcode/database` |
| `drizzle-kit@^0.31.0` | `@leetcode/database` (dev) |
| `vitest@^2.0.0` | Tất cả apps/packages (dev) |
| `eslint@^9.0.0` | Tất cả apps/packages (dev) |
| `typescript@^5.5.0` | Tất cả apps/packages (dev) |
| `tsx@^4.16.0` | `@leetcode/server` (dev) |
| `@types/node@^22.0.0` | `@leetcode/server`, `@leetcode/problem-engine` (dev) |
| `@types/react@^18.3.0` | `@leetcode/web` (dev) |
| `@types/react-dom@^18.3.0` | `@leetcode/web` (dev) |
| `jsdom@^24.0.0` | `@leetcode/extension` (dev, cho clipper.test.ts — pure extraction logic) |

## Shared Packages

Tất cả package nội bộ đều dùng `workspace:*` alias `@leetcode/*`.

## Package Relationships

```text
@leetcode/shared
  ├── (không phụ thuộc package nội bộ nào)
  └── được dùng bởi: tất cả apps (web, server) và packages khác; ProblemClip được dùng bởi web + server + extension (copy type)

@leetcode/database
  ├── @leetcode/shared
  └── được dùng bởi: @leetcode/problem-engine, @leetcode/server

@leetcode/editor
  ├── @leetcode/shared
  └── được dùng bởi: @leetcode/web

@leetcode/javascript-docs
  ├── @leetcode/shared
  └── (chưa có consumer rõ ràng)

@leetcode/problem-engine
  ├── @leetcode/shared
  ├── @leetcode/database
  └── được dùng bởi: @leetcode/web, @leetcode/server

@leetcode/ai
  ├── @leetcode/shared
  └── được dùng bởi: @leetcode/server
```