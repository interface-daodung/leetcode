# Web Frontend {#web-frontend}

## Giới thiệu {#gioi-thieu}

`apps/web` là SPA dùng **React 18.3 + Vite 5**. Hiện tại có một màn hình đơn giản cho phép nhập code vào textarea và chạy code cục bộ.

## Entry {#entry}

```text
apps/web/index.html
  └─ src/main.tsx (ReactDOM.createRoot)
       └─ App.tsx
            ├─ createEditorState() (từ @leetcode/editor)
            ├─ textarea hiển thị code (mặc định languageTemplates.javascript)
            ├─ handleRun: new Function("return " + code)() → chạy cục bộ
            └─ hiển thị output dạng JSON hoặc error
```

## Tính năng {#tinh-nang}

- Chạy code cục bộ bằng `new Function` — không gọi API server.
- Hiển thị output dạng JSON hoặc error.

## Ghi chú {#ghi-chu}

- Chưa có routing, state management, Monaco Editor thật, API client.
- Dependencies: `@leetcode/shared`, `@leetcode/editor`, `@leetcode/problem-engine`.