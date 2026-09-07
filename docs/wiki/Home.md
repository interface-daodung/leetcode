# LeetCode Lab Wiki {#home}

> Monorepo để học algorithms, data structures và full-stack development thông qua giải LeetCode problems.

---

## 🚀 Bắt đầu nhanh

| Hành động | Lệnh |
|-----------|------|
| Cài đặt | `pnpm install` |
| Chạy Web (port 5173) | `pnpm dev` |
| Chạy Server (port 3000) | `pnpm --filter=@leetcode/server dev` |
| Build & type-check | `pnpm -r build` |
| Chạy test | `pnpm -r test` |
| Lint | `pnpm -r lint` |

---

## 📖 Nội dung Wiki

### Cơ bản
- [Cài đặt và chạy](Getting-Started.md) — Yêu cầu, cài đặt, dev commands, DB commands
- [Kiến trúc tổng quan](Architecture.md) — Monorepo structure, dependency flow, runtime flow, công nghệ, database

### Ứng dụng
- [Web Frontend](Web-Frontend.md) — React 18 + Vite + Tailwind + FlexLayout, dockable layout, Editor, Explorer, Output
- [API Server](API-Server.md) — Fastify 4, endpoints, validation, MVC architecture, run code flow
- [Extension](Extension.md) — MV3 browser extension, DOM clip, widget, direct import

### Package cốt lõi
- [Problem Engine](Problem-Engine.md) — In-memory registry, test runner, state/tree model
- [Database](Database.md) — SQLite + Drizzle ORM, schema, auto-migrate, CRUD
- [Layout](Layout.md) — FlexLayout wrap, dockable IDE layout
- [Shared](Shared.md) — Types, utilities, constants
- [AI Hints](AI-Hints.md) — Placeholder LLM integration
- [JavaScript Docs](JavaScript-Docs.md) — Static JS/TS reference + autocomplete

### Phát triển
- [Development Guide](Development.md) — Git workflow, conventions, testing, linting, branching
- [Technical Decisions](Technical-Decisions.md) — Quyết định kỹ thuật quan trọng
- [Glossary](Glossary.md) — Thuật ngữ chuyên dụng

---

## 🔗 Liên kết hữu ích

- [GitHub Repository](https://github.com/interface-daodung/leetcode)
- [Issues](https://github.com/interface-daodung/leetcode/issues)
- [Discussions](https://github.com/interface-daodung/leetcode/discussions)

---

*Cập nhật: 2026-09-07 — Branch: `feat/tray-spawn`*