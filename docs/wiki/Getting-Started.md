# Cài đặt và chạy {#cai-dat-va-chay}

## Yêu cầu

- **Node.js** >= 20
- **pnpm** 11.24.0 (khai báo trong `package.json`)

## Cài đặt

```bash
pnpm install
```

## Chạy Development

### Web (Frontend) — Port 5173

```bash
pnpm dev
```

Chạy `apps/web` (React 18 + Vite + Tailwind CSS 4 + FlexLayout) tại `http://localhost:5173`.

### Server (API) — Port 3000

```bash
pnpm --filter=@leetcode/server dev
```

Chạy `apps/server` (Fastify 4) tại `http://localhost:3000`. API docs: `GET /health`, `GET /api/problems`, ...

### Extension

```bash
pnpm --filter=@leetcode/extension sync:config  # Cập nhật api-config.js từ root .env
# Sau đó load unpacked folder `apps/extension` vào Chrome/Edge
```

Widget LC draggable xuất hiện trên `leetcode.com/problems/*`.

## Database

Database tự động migrate khi import package `@leetcode/database` (trong `packages/database/src/client.ts`).

CLI hỗ trợ:

```bash
pnpm --filter=@leetcode/database db:generate   # Tạo migration mới
pnpm --filter=@leetcode/database db:migrate    # Chạy migration (optional)
pnpm --filter=@leetcode/database db:studio     # Drizzle Studio
```

DB file: `packages/database/data/leetcode.db` (SQLite, bị git ignore).

## Build & Kiểm tra

```bash
pnpm -r build      # Type-check tất cả apps/packages (tsc --noEmit cho packages, tsc emit cho apps)
pnpm -r lint       # ESLint toàn bộ workspace
pnpm -r test       # Vitest (mỗi package có test)
```

## Cấu trúc Workspace

```text
apps/
  web         # React SPA (port 5173)
  server      # Fastify API (port 3000)
  extension   # MV3 Browser Extension
packages/
  shared           # Types, utilities
  database         # Drizzle + SQLite
  problem-engine   # Registry + test runner
  ai               # AI placeholder
  javascript-docs  # JS/TS static docs
  layout           # FlexLayout wrap
```

Xem [Kiến trúc](Architecture.md) để biết thêm chi tiết.