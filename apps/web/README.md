# @leetcode/web

React 18 + Vite frontend cho LeetCode Lab.

## Tính năng

- Textarea editor + run code cục bộ (`new Function`)
- Hiển thị output dạng JSON hoặc error

## Chạy

```bash
pnpm dev
```

Web chạy tại `http://localhost:5173`.

## Entry

```text
index.html → src/main.tsx → App.tsx
```

## Công nghệ

- React 18.3, Vite 5, `@vitejs/plugin-react`

## Tài liệu

- [Web Frontend](../../docs/features/web-frontend.md)

## Ghi chú

- Hiện chạy code cục bộ, chưa gọi API server.
- Chưa có routing, state management, Monaco Editor thật, API client.