# Cài đặt và chạy project {#cai-dat}

## Yêu cầu

- Node.js >= 20
- pnpm 11.24.0

## Cài đặt

```bash
pnpm install
```

## Chạy development

### Web (frontend)

```bash
pnpm dev
```

Web chạy tại `http://localhost:5173`.

### Server (API)

```bash
pnpm --filter=@leetcode/server dev
```

Server chạy tại `http://localhost:3000` (Fastify với logger).

### Database

Database tự động migrate khi import package `@leetcode/database` (trong `client.ts`). CLI hỗ trợ:

```bash
pnpm --filter=@leetcode/database db:generate   # Tạo migration mới
pnpm --filter=@leetcode/database db:migrate    # Chạy migration (optional)
pnpm --filter=@leetcode/database db:studio     # Drizzle Studio
```

## Build và kiểm tra

```bash
pnpm -r build      # Type-check tất cả apps/packages
pnpm -r lint       # ESLint toàn bộ workspace
pnpm -r test       # Vitest (chưa có test file)
```

## Cấu trúc workspace

```text
apps/web        # React 18 + Vite, port 5173
apps/server     # Fastify API, port 3000
packages/       # 6 package nội bộ dùng chung
```

Xem [kiến trúc](architecture.md) để biết thêm chi tiết.