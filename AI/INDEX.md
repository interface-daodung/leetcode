# AI Agent Index

> Đây là file đầu tiên Agent phải đọc khi bắt đầu làm việc với repository.

---

## Project

- `PROJECT.md`
- `CONVENTIONS.md`
- `STATUS.md`

> Lưu ý: `ARCHITECTURE.md`, `index/`, `walkthrough/` đã archive sang `history/archived/` — hiểu kiến trúc/codebase bằng GitNexus (`query`, `context`, `impact`), không đọc các file archive.

---

## Development Workflow

### Feature

`skills/feature-development/SKILL.md`

### Bug

`skills/bug-fix/SKILL.md`

### Context Cleanup

`skills/context-cleanup/SKILL.md`

### Code Review

`skills/code-review/SKILL.md`

### Database

`skills/database-change/SKILL.md`

### Docs Generator

`skills/docs-generator/SKILL.md`

### Walkthrough

`skills/walkthrough/SKILL.md` (archive: `history/archived/walkthrough/`)

---

## Current Work

Kiểm tra:

`plans/active/`

---

## History

Lịch sử thay đổi:

`history/`

---

## Context

### Technical Decisions

`context/decisions.md`

### Known Issues

`context/known-issues.md`

### Glossary

`context/glossary.md`

---

## Important Rule

Không đọc toàn bộ repository một cách máy móc.

Hãy:

```text
Task
 ↓
INDEX
 ↓
STATUS / CONVENTIONS
 ↓
GitNexus (query / context / impact)
 ↓
Relevant source
```

Nếu cấu trúc repository thay đổi, dùng GitNexus để cập nhật hiểu biết — `AI/index/` đã archive, không cập nhật nữa.

---

## Cấu trúc repository (đã xác định từ source code)

Monorepo pnpm với 3 ứng dụng và 6 package:

```text
apps/web       # React 18 + Vite frontend (Tailwind + Router, Sidebar + ProblemDetail)
apps/server    # Fastify API server (có POST /api/problems/import)
apps/extension # MV3 Browser Extension — widget clip DOM trên leetcode.com/problems/*
packages/shared           # Types, utilities, constants (có ProblemClip)
packages/database         # Drizzle ORM + SQLite (libsql)
packages/editor           # Editor state, language templates
packages/problem-engine   # Problem registry, test runner (in-memory + hydrate)
packages/ai               # LLM integration (placeholder)
packages/javascript-docs  # JS/TS reference docs (static)
```

Chi tiết: dùng GitNexus (`gitnexus://repo/leetcode/clusters`, `query`) — bản sao tĩnh tại `history/archived/index/PROJECT_STRUCTURE.md`.
