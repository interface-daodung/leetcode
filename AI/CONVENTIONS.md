# Coding Conventions

## Ngôn ngữ

- Documentation: tiếng Việt.
- Comment: tiếng Việt khi cần.
- Tên biến/function/class: theo convention của ngôn ngữ/framework.

---

## Package Manager

- pnpm 11.24.0 (khai báo trong root `package.json`).
- Workspace: `apps/*`, `packages/*` (`pnpm-workspace.yaml`).
- Package nội bộ tham chiếu bằng `workspace:*` và alias `@leetcode/*`.

---

## TypeScript

- `strict: true` ở tất cả tsconfig.
- Root tsconfig: target ES2022, module NodeNext, moduleResolution NodeNext.
- `packages/*` dùng `main`/`types` trỏ trực tiếp vào `src/index.ts`.
- `apps/server`: module NodeNext, outDir `./dist`.
- `apps/web`: module ESNext + moduleResolution bundler, JSX `react-jsx`.
- Path alias trong tsconfig/vite cho `@leetcode/*`.
- Các package đều có `build: tsc --noEmit`.

---

## Linter

- ESLint 9.
- Script chuẩn mỗi package: `lint: eslint src --ext .ts` (web dùng `.ts,.tsx`).

---

## Testing

- Vitest 2.
- Script chuẩn: `test: vitest run` (đã khai báo ở tất cả apps/packages).
- Hiện chưa có test file nào trong repository.

---

## Framework Conventions

- Web: React 18 + Vite, entry `apps/web/index.html` → `src/main.tsx` → `App.tsx`.
- Server: Fastify 4, validation bằng Zod (`z.object().parse(...)`), logger bật (`{ logger: true }`).
- Database: Drizzle ORM + SQLite (`@libsql/client`).
- Migration: drizzle-kit (`db:generate`), auto-migrate runtime trong `client.ts` (`migrate()`), CLI optional `db:migrate`, `db:studio`.

---

## Import Conventions

- Import package nội bộ qua alias workspace `@leetcode/<name>`.
- Type-only import dùng `import type { ... }` khi chỉ import kiểu (đã thấy trong source).

---

## Code

Ưu tiên:

- code rõ ràng
- function nhỏ
- trách nhiệm đơn nhất
- abstraction vừa đủ
- tránh premature optimization
- tránh over-engineering

---

## Không phát minh lại bánh xe

Không tự viết lại:

- parser
- validator
- HTTP client
- ORM
- router
- state management
- utility phổ biến

nếu project đã có giải pháp phù hợp.

Nếu cố tình tự triển khai, phải ghi rõ lý do.

---

## Git Workflow

- AI tự chủ commit/tạo nhánh/merge cục bộ — không cần xin phép từng lần.
- Chỉ stage đúng file thuộc phạm vi task (kiểm tra `git status`/`git diff` trước).
- KHÔNG push lên remote, không publish, không tạo PR — remote chỉ do user chủ động.
- Message commit: `feat(x):`, `fix(x):`, `refactor(x):`, `docs(x):` — xem `git log --oneline`.

---

## Folder Convention

- Apps: `apps/<name>/src/`
- Packages: `packages/<name>/src/`
- Chỉ export qua `src/index.ts` (entry point của package).
- Scripts thủ công: `scripts/`
- Migration drizzle: `packages/database/drizzle/`
