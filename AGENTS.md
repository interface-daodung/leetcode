# Agent Instructions

## Khởi động

Trước khi làm task, đọc theo thứ tự:

1. `AI/INDEX.md`
2. `AI/STATUS.md`
3. `AI/CONVENTIONS.md`
4. Xác định module liên quan → đọc `AI/index/` và `AI/walkthrough/` liên quan.

Không đọc toàn bộ repository trừ khi cần thiết.

## Commands

```bash
pnpm install                          # cài dependency
pnpm dev                              # web trên :5173
pnpm --filter=@leetcode/server dev    # server trên :3000 (tsx watch)
pnpm -r build | test | lint           # chạy toàn bộ workspace
pnpm --filter=<pkg> test              # test 1 package (mỗi app/package đều có test/lint/build)
pnpm --filter=@leetcode/database db:generate|db:migrate|db:studio   # drizzle-kit
```

- `build` của `packages/*` là `tsc --noEmit` (chỉ type-check, không emit). Chỉ `apps/server` (tsc → dist) và `apps/web` (tsc && vite build) mới emit.
- Lint: ESLint 9, `eslint src --ext .ts` (web dùng `.ts,.tsx`). Test: Vitest 2, `vitest run`.

## Kiến trúc

- pnpm monorepo: `apps/*` (web, server) + `packages/*` (shared, database, editor, problem-engine, ai, javascript-docs).
- Dependency chảy `apps → packages`; package nội bộ import qua alias `@leetcode/*` + `workspace:*`.
- Toàn bộ ESM (`"type": "module"`, NodeNext). Import file cùng package phải ghi đuôi `.js` (vd `./schema.js`).
- Package chỉ export qua `src/index.ts`.

## Gotchas

- **Server đọc problem từ in-memory registry** (`engine`, `Map`), KHÔNG đọc từ SQLite. `problemDb.add` chỉ ghi fire-and-forget (`void`) khi `engine.register`.
- `problems/` chỉ chứa thư mục rỗng; seed script đã bị bỏ. Để API có dữ liệu phải gọi `engine.register(...)`.
- DB auto-migrate khi import `@leetcode/database` (`client.ts` gọi `migrate()`). Path cố định `packages/database/data/leetcode.db` (resolve từ `import.meta.url`, không phụ thuộc CWD — đừng đổi). `*.db` bị gitignore.
- Chạy code dùng `new Function("return " + code)` — là thiết kế, không phải bug.
- `packages/ai` là placeholder, chưa gọi LLM thật.

## Testing

- Hiện chưa có test file (chỉ template ở `AI/skills/vitest-logic-testing/test-template.test.ts`).
- Khi viết test logic: đặt `*.test.ts` cạnh file logic, tham khảo `AI/skills/vitest-logic-testing/skill.md`.

## Conventions

- Documentation và comment code: tiếng Việt.
- TypeScript `strict: true` ở mọi nơi.
- Không tự commit/merge/push trừ khi được yêu cầu. Không xóa file ngoài phạm vi task.
- Plan: lưu `AI/plans/active/<name>.md`; khi xong chạy `AI\skills\feature-development\move-plan-to-completed.bat <name>` từ repo root (xem `AI/skills/feature-development/SKILL.md`).
- Sau khi đổi code, cập nhật `AI/ARCHITECTURE.md`, `AI/CONVENTIONS.md`, `AI/INDEX.md`, `AI/PROJECT.md`, `AI/context/glossary.md`, `AI/context/decisions.md`, `AI/context/known-issues.md`, `AI/walkthrough/`, `AI/history/` nếu liên quan.

## Source of Truth

Source code là nguồn sự thật. Nếu `AI/` mâu thuẫn source code → cập nhật documentation, không sửa code để khớp tài liệu.
