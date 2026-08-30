# LeetCode Lab — Learning Journey Monorepo

> Monorepo học algorithms, data structures và full-stack development qua giải LeetCode problems.

## Philosophy

> **"Feature này giúp tôi học công nghệ hoặc lưu lại hành trình lập trình của mình như thế nào?"**

Đây là một **learning lab**, không phải product thương mại.

## Cấu trúc

```text
apps/
├── web/          # React 18 + Vite frontend (chạy code cục bộ)
└── server/       # Fastify API (problems, test runner, AI hints)
packages/
├── shared/           # Types, utilities, constants
├── database/         # Drizzle ORM + SQLite
├── editor/           # Editor state, language templates
├── javascript-docs/  # JS/TS reference (static)
├── problem-engine/   # In-memory registry + test runner
└── ai/               # LLM integration (placeholder)
problems/         # Dự kiến chứa problem files (rỗng)
docs/             # Tài liệu người dùng
docker/           # Dự kiến container configs (rỗng)
```

## Quick Start

```bash
pnpm install                          # Cài dependency
pnpm dev                              # Web trên :5173
pnpm --filter=@leetcode/server dev    # Server trên :3000
```

Database tự động migrate khi server khởi động (auto-migrate trong `packages/database/src/client.ts`, migration `0000_init.sql` chứa 3 problems mẫu).

## Tài liệu

Xem [docs/](docs/README.md) cho hướng dẫn chi tiết:

- [Cài đặt và chạy project](docs/getting-started.md)
- [Kiến trúc tổng quan](docs/architecture.md)
- [API Server](docs/features/api-server.md)
- [Web Frontend](docs/features/web-frontend.md)
- [Problem Engine](docs/features/problem-engine.md)
- [Database](docs/features/database.md)
- [AI Hints](docs/features/ai-hints.md)

## Learning Goals

| Package | Nội dung học |
|---------|--------------|
| `shared` | TypeScript types, monorepo package design |
| `database` | Data modeling, migrations, ORM |
| `editor` | Editor state, language templates |
| `javascript-docs` | Documentation reference |
| `problem-engine` | Test runner, isolated code execution |
| `ai` | LLM APIs, prompt engineering, streaming |
| `web` | React 18, Vite |
| `server` | Fastify, Zod validation |

## Nguyên tắc phát triển

1. **Bắt đầu đơn giản** — in-memory storage trước, thêm persistence khi cần
2. **Type-safe ở mọi nơi** — shared types qua `@leetcode/shared`
3. **Test-driven** — viết test cho problem engine, AI responses
4. **Ghi lại quyết định** — ADR trong `docs/` cho architectural choices
5. **Không abstraction sớm** — chỉ tách package khi tái sử dụng

## Next Steps (roadmap)

- [ ] Thống nhất ORM cho problem persistence (Prisma vs Drizzle)
- [ ] Tích hợp Monaco Editor trong web app
- [ ] Thêm WebSocket cho real-time code execution
- [ ] Implement AI hint streaming với Vercel AI SDK
- [ ] Build problem import từ LeetCode API
- [ ] Thêm progress tracking và spaced repetition

## License

MIT — For learning purposes