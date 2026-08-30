# Frontend Walkthrough

> Tài liệu này sẽ được bổ sung dựa trên implementation thực tế.

## Overview

`apps/web` là SPA React 18 + Vite. Hiện tại chỉ có một màn hình đơn giản cho phép nhập code vào textarea và chạy code cục bộ.

## Flow

```text
apps/web/index.html
  └─ src/main.tsx (ReactDOM.createRoot)
       └─ App.tsx
            ├─ createEditorState() (từ @leetcode/editor)
            ├─ textarea hiển thị code (mặc định languageTemplates.javascript)
            ├─ handleRun: new Function("return " + code)() → chạy cục bộ
            └─ hiển thị output dạng JSON hoặc error
```

## Important Components

- `App.tsx` — component chính, state `editorState` và `output`.
- `main.tsx` — mount React vào `#root`.
- `index.html` — entry HTML (title: LeetCode Lab).

## Entry Points

- `apps/web/index.html`
- `apps/web/src/main.tsx`

## Related Files

- `apps/web/vite.config.ts` — Vite config, alias `@leetcode/*`.
- `packages/editor/src/index.ts` — editor state và templates.
- `packages/shared/src/index.ts` — utils (ví dụ `formatProblemId`).

## Notes

- Web hiện chưa gọi API server (`apps/server`); code được chạy hoàn toàn cục bộ bằng `new Function`.
- Chưa có routing, state management, hoặc Monaco Editor thật.
