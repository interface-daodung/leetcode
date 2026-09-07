# Development Guide {#development-guide}

## Git Workflow (Tự chủ cục bộ)

Theo `AGENTS.md` + `AI/CONVENTIONS.md`:

- AI **tự chủ** thao tác git cục bộ — không cần xin phép từng lần
- **Commit thường xuyên**: sau mỗi phần việc hoàn chỉnh (implement xong, fix xong, docs cập nhật)
  - Message convention: `feat(x):`, `fix(x):`, `refactor(x):`, `docs(x):` — xem `git log --oneline`
- **Tự tạo nhánh**: khi bắt đầu tính năng mới/ké hoạch, tạo nhánh `feat/<name>` / `fix/<name>`
- **Merge nội bộ**: được phép merge giữa các nhánh cục bộ khi hợp lý
- **KHÔNG public**: tuyệt đối **không `push` lên remote**, không `publish`, không tạo PR/release
  - Remote chỉ phục vụ đồng bộ cá nhân khi user chủ động
- Khi commit: chỉ stage đúng file thuộc phạm vi task (kiểm tra `git status`/`git diff` trước)
- Không bao giờ commit secret/key/.env
- Không xóa file ngoài phạm vi task

### Plan Management

- Plan lưu tại `AI/plans/active/<name>.md`
- Khi xong: chạy `AI\skills\feature-development\move-plan-to-completed.bat <name>` từ repo root
- Xem `AI/skills/feature-development/SKILL.md`

## Branch Hiện Tại

```bash
git branch --show-current
# feat/tray-spawn
```

## Commands

```bash
# Cài đặt
pnpm install

# Dev
pnpm dev                              # Web (5173)
pnpm --filter=@leetcode/server dev    # Server (3000)

# Build / Test / Lint toàn workspace
pnpm -r build
pnpm -r test
pnpm -r lint

# Test 1 package
pnpm --filter=@leetcode/<pkg> test

# Database
pnpm --filter=@leetcode/database db:generate
pnpm --filter=@leetcode/database db:migrate
pnpm --filter=@leetcode/database db:studio
```

## Build Behavior

| Package | Build Command | Output |
|---------|---------------|--------|
| `packages/*` | `tsc --noEmit` | Type-check only, không emit |
| `apps/server` | `tsc` | Emit `dist/` |
| `apps/web` | `tsc && vite build` | Emit `dist/` |

## Lint & Test

- **Lint**: ESLint 9, `eslint src --ext .ts` (web: `.ts,.tsx`)
- **Test**: Vitest 2, `vitest run`
- Mỗi app/package đều có scripts `build`/`test`/`lint`

## TypeScript Conventions

- `strict: true` ở tất cả tsconfig
- Root: target ES2022, module NodeNext, moduleResolution NodeNext
- Packages: `main`/`types` trỏ vào `src/index.ts`
- Server: module NodeNext, outDir `./dist`
- Web: module ESNext + bundler, JSX `react-jsx`
- Path alias `@leetcode/*` trong tsconfig/vite
- Import file cùng package **phải ghi đuôi `.js`** (vd `./schema.js`)
- Type-only import: `import type { ... }`

## Framework Conventions

- **Web**: React 18 + Vite, entry `index.html` → `main.tsx` → `App.tsx`
- **Server**: Fastify 4, validation Zod (`z.object().parse(...)`), logger bật
- **Database**: Drizzle ORM + SQLite (`@libsql/client`)
- **Migration**: drizzle-kit (`db:generate`), auto-migrate runtime trong `client.ts`

## Luật Phân Tầng (Bắt Buộc)

1. **Server chỉ chứa code API** (routes, controllers, plugins, config, wiring) — không domain logic
2. **Model/entity dùng chung đặt ở `packages/shared`** — server và client import chung
3. **Domain logic độc lập đặt trong `packages/*`** — server chỉ gọi service
4. **Logic vẽ giao diện đặt trong `apps/web/src/components/`** — không tách component ra package; layout ở `apps/web/src/layout/`

## Import Conventions

- Package nội bộ qua alias workspace `@leetcode/<name>`
- Type-only import: `import type { ... }`

## Code Style

- Code rõ ràng, function nhỏ, trách nhiệm đơn nhất
- Abstraction vừa đủ, tránh premature optimization, tránh over-engineering
- Không tự viết lại parser/validator/HTTP client/ORM/router/state management/utility phổ biến nếu đã có giải pháp phù hợp

## Testing

- Hiện chưa có test file nhiều (chỉ template ở `AI/skills/vitest-logic-testing/test-template.test.ts`)
- Khi viết test logic: đặt `*.test.ts` cạnh file logic, tham khảo `AI/skills/vitest-logic-testing/skill.md`

## Source of Truth

**Source code là nguồn sự thật**. Nếu `AI/` mâu thuẫn source code → cập nhật documentation, không sửa code để khớp tài liệu.

## graphify

- Knowledge graph tại `graphify-out/` (god nodes, community, cross-file relationships)
- Khi hỏi về codebase: dùng `graphify query "<question>"`, `graphify path "<A>" "<B>"`, `graphify explain "<concept>"`
- Sau khi sửa code: chạy `graphify update .` (AST-only, no API cost)