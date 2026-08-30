# AI Agent Index

> Đây là file đầu tiên Agent phải đọc khi bắt đầu làm việc với repository.

---

## Project

- `PROJECT.md`
- `ARCHITECTURE.md`
- `CONVENTIONS.md`
- `STATUS.md`

---

## Source Code Index

### Repository

`index/PROJECT_STRUCTURE.md`

### Applications

`index/APP_STRUCTURE.md`

### Packages

`index/PACKAGE_STRUCTURE.md`

### Data

`index/DATA_STRUCTURE.md`

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

### API

`skills/add-api/SKILL.md`

### Database

`skills/database-change/SKILL.md`

### General Agent Workflow

`skills/agent-workflow/SKILL.md`

### Docs Generator

`skills/docs-generator/SKILL.md`

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
Relevant index
 ↓
Relevant walkthrough
 ↓
Relevant source
```

Nếu cấu trúc repository thay đổi, cập nhật `AI/index/`.

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

Chi tiết: `index/PROJECT_STRUCTURE.md`
