# LeetCode Lab - Learning Journey Monorepo

A monorepo for learning algorithms, data structures, and full-stack development through LeetCode problems.

## Philosophy

> **"Feature này giúp tôi học công nghệ hoặc lưu lại hành trình lập trình của mình như thế nào?"**

Every feature in this repo should answer this question. This is a **learning lab**, not a product.

## Architecture

```
leetcode/
├── apps/
│   ├── web/          # React frontend - practice coding in browser
│   └── server/       # Fastify API - problem engine, AI hints
├── packages/
│   ├── shared/       # Types, utilities, constants
│   ├── database/     # Problem storage (in-memory → SQLite → PostgreSQL)
│   ├── editor/       # Monaco/CodeMirror integration, templates
│   ├── javascript-docs/  # JS/TS reference for problem solving
│   ├── problem-engine/   # Test runner, problem registry
│   └── ai/           # LLM integration for hints/explanations
├── problems/
│   ├── easy/         # Markdown/JSON problem files
│   ├── medium/
│   └── hard/
├── docs/             # Learning notes, architecture decisions
├── scripts/          # Automation, seeding, migration
└── docker/           # Container configs
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev        # Web on :5173
pnpm --filter=@leetcode/server dev  # Server on :3000
```

Database tự động migrate + seed khi server khởi động (auto-migrate trong `packages/database/src/client.ts`, migration `0000_init.sql` chứa 3 problems mẫu).

## Learning Goals

| Package | What You'll Learn |
|---------|-------------------|
| `shared` | TypeScript types, monorepo package design |
| `database` | Data modeling, migrations, ORM (Prisma/Drizzle) |
| `editor` | Monaco Editor, code execution sandboxing |
| `javascript-docs` | MDX, documentation site generation |
| `problem-engine` | Test runners, isolated code execution |
| `ai` | LLM APIs, prompt engineering, streaming |
| `web` | React 18, Vite, state management |
| `server` | Fastify, Zod validation, WebSocket |

## Development Principles

1. **Start simple** - In-memory storage first, add persistence when needed
2. **Type-safe everywhere** - Shared types via `@leetcode/shared`
3. **Test-driven** - Write tests for problem engine, AI responses
4. **Document decisions** - ADR in `docs/adr/` for architectural choices
5. **No premature abstraction** - Extract packages only when reused

## Next Steps

- [ ] Add Prisma + SQLite for problem persistence
- [ ] Integrate Monaco Editor in web app
- [ ] Add WebSocket for real-time code execution
- [ ] Implement AI hint streaming with Vercel AI SDK
- [ ] Build problem import from LeetCode API
- [ ] Add progress tracking and spaced repetition

## License

MIT - For learning purposes