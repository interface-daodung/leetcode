# Agent Instructions

## Khởi động

Trước khi làm task, đọc theo thứ tự:

1. `AI/INDEX.md`
2. `AI/STATUS.md`
3. `AI/CONVENTIONS.md`
4. Dùng GitNexus (`query`, `context`, `impact`) để hiểu codebase — không đọc `AI/index/`, `AI/ARCHITECTURE.md`, `AI/walkthrough/` (đã archive).

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

## Git Workflow (tự chủ cục bộ)

AI được phép **tự chủ thao tác git cục bộ** để quản lý tiến độ liên tục:

- **Commit thường xuyên**: sau mỗi phần việc hoàn chỉnh (implement xong, fix xong, docs cập nhật), commit ngay với message rõ ràng, đúng convention.
- **Tự tạo nhánh**: khi bắt đầu một tính năng mới hoặc triển khai một kế hoạch, tự tạo nhánh `feat/<name>` hoặc `fix/<name>` rồi làm việc trên nhánh đó.
- **Merge nội bộ**: được phép merge giữa các nhánh cục bộ (vd gộp `fix/*` về `feat/*`) khi hợp lý.
- **KHÔNG được public lên**: tuyệt đối không `push` lên remote, không `publish`, không tạo PR/release. Remote chỉ phục vụ đồng bộ cá nhân khi user tự chủ động.

Quy tắc khi commit:

- Chỉ stage đúng các file thuộc phạm vi công việc hiện tại (kiểm tra `git status`/`git diff` trước), không commit file lạ hoặc file vô tình sửa.
- Không bao giờ commit secret/key/.env.
- Message commit ngắn gọn, khớp style repo (xem `git log --oneline`): vd `feat(x): ...`, `fix(x): ...`, `refactor(x): ...`, `docs(x): ...`.
- Không xóa file ngoài phạm vi task.
- Sau khi commit xong, ghi nhận trạng thái vào `AI/STATUS.md` và `AI/history/` nếu thay đổi lớn.

Plan: lưu `AI/plans/active/<name>.md`; khi xong chạy `AI\skills\feature-development\move-plan-to-completed.bat <name>` từ repo root (xem `AI/skills/feature-development/SKILL.md`).

## Source of Truth

Source code là nguồn sự thật. Nếu `AI/` mâu thuẫn source code → cập nhật documentation, không sửa code để khớp tài liệu.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **leetcode** (2342 symbols, 3708 relationships, 88 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact analysis before editing.** Use `impact({target: "symbolName", direction: "upstream"})` (MCP) or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .` (CLI fallback); report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "master"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "master" --repo .`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/leetcode/context` | Codebase overview, check index freshness |
| `gitnexus://repo/leetcode/clusters` | All functional areas |
| `gitnexus://repo/leetcode/processes` | All execution flows |
| `gitnexus://repo/leetcode/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | Use GitNexus `query`/`context` instead |
| Blast radius / "What breaks if I change X?" | `AI/skills/gitnexus-impact-analysis/SKILL.md` (note: relocated from .claude — see `AI/skills/`) |
| Trace bugs / "Why is X failing?" | `AI/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `AI/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `AI/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `AI/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
