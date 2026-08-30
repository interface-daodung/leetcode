# @leetcode/editor

Editor state và language templates cho LeetCode Lab.

## Nội dung

- `EditorState` — `{ code: string; language: string; problemId?: number }`
- `createEditorState` — tạo editor state mặc định
- `languageTemplates` — templates code theo language (ví dụ `languageTemplates.javascript`)

## Dependency

- `@leetcode/shared`

## Tài liệu

- [Web Frontend](../../docs/features/web-frontend.md) — editor được dùng trong `App.tsx`