# Agent Instructions

## Khởi động

Trước khi làm task, đọc theo thứ tự:

1. `AI/INDEX.md`
2. `AI/STATUS.md`
3. `AI/CONVENTIONS.md`

Không đọc `AI/index/`, `AI/ARCHITECTURE.md`, `AI/walkthrough/` (đã archive); không đọc toàn bộ repository trừ khi cần thiết.

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

- pnpm monorepo: `apps/*` (web, server) + `packages/*` (shared, database, problem-engine, ai, javascript-docs).
- Dependency chảy `apps → packages`; package nội bộ import qua alias `@leetcode/*` + `workspace:*`.
- Toàn bộ ESM (`"type": "module"`, NodeNext). Import file cùng package phải ghi đuôi `.js` (vd `./schema.js`).
- Package chỉ export qua `src/index.ts`.

### Luật phân tầng (bắt buộc)

1. **Server (`apps/server`) chỉ chứa code API**: routes, controllers, plugins, config, wiring. Không chứa domain logic.
2. **Model/entity dùng chung đặt ở `packages/shared`** — server và client import từ đó để không lệch tên trường, không khai báo trùng.
3. **Domain logic độc lập đặt trong `packages/*`** (vd `problem-engine`: registry, tree, test runner) — không nhét vào server. Server chỉ gọi service từ package.
4. **Logic vẽ giao diện đặt trong `apps/web/src/components/`** — không tách component web ra package riêng (layout cũng nằm trong `apps/web/src/layout/`).

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

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
