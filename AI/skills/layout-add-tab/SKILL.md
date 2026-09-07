---
name: layout-add-tab
description: Hướng dẫn thêm một panel/tab mới vào dockable layout (FlexLayout) của apps/web. Use when thêm tab mới, panel mới, hoặc đăng ký component mới vào workspace.
---

# Thêm Tab/Panel Mới Vào Dockable Layout

## Mục tiêu

Thêm một panel mới (ví dụ: **Notes**, **Terminal**, **Debug**) vào layout IDE-like của `apps/web` (FlexLayout). Hướng dẫn này liệt kê **tất cả file phải sửa** theo thứ tự, và các bẫy thường gặp.

## Kiến trúc tóm tắt

Layout được chia 2 tầng:

1. **`packages/layout`** — tầng dùng chung, định nghĩa tên component + vị trí mặc định.
2. **`apps/web`** — tầng UI, map tên component → React panel + menu View.

```
LayoutComponentName (packages/layout)
   └── factory (apps/web/WorkspaceLayout.tsx) → render panel
   └── ALL_COMPONENTS → menu View (apps/web/Header.tsx)
   └── defaultTabsetId / defaultTabJson → reopenPanel (WorkspaceContext)
```

## Các file phải sửa

### 1. `packages/layout/src/workspace.ts` — đăng ký tên + vị trí

| Mục | Chi tiết |
|-----|----------|
| `LayoutComponentName` (dòng 7) | Thêm literal mới, vd `\| "notes"` |
| `ALL_COMPONENTS` (dòng 10) | Thêm `"notes"` vào mảng |
| `DefaultTabsetId` (dòng 13) | Nếu tab mới vào tabset mới: thêm `\| "tabset-notes"` |
| `defaultTabsetId()` (dòng 23) | Thêm `case` trả tabset mặc định cho tab mới |
| `defaultName()` (dòng 93) | Thêm `case` trả tên hiển thị (vd `"Notes"`) |
| `createDefaultLayout()` (dòng 45) | **Tùy chọn** — nếu muốn tab xuất hiện ngay trong default layout, thêm `tabs("notes", defs)` + đặt vào cấu trúc `layout.children` |

> `defaultTabJson()` (dòng 36) và `toJsonTab()` (dòng 106) **không cần sửa** — chúng generic.

**Ví dụ thêm tab `notes` vào tabset-output (dưới phải):**

```ts
export type LayoutComponentName = "explorer" | "editor" | "description" | "output" | "notes";
export const ALL_COMPONENTS: LayoutComponentName[] = ["explorer", "editor", "description", "output", "notes"];

export function defaultTabsetId(component: LayoutComponentName): DefaultTabsetId {
  switch (component) {
    case "explorer": return "tabset-explorer";
    case "editor":
    case "description": return "tabset-editor";
    case "output":
    case "notes": return "tabset-output";
  }
}
```

### 2. Tạo panel component mới trong `apps/web/src/components/workspace/`

Tạo `NotesPanel.tsx` theo mẫu `OutputPanel.tsx` / `ExplorerPanel.tsx`:

- Dùng `useWorkspace()` để truy cập state nếu cần.
- Component phải tự chiếm toàn bộ vùng: root `<div className="h-full ...">`.
- **Không được** dùng model trực tiếp — chỉ qua context.

### 3. `apps/web/src/components/workspace/WorkspaceLayout.tsx` — factory

Thêm import + `case` vào factory:

```tsx
import { NotesPanel } from "./NotesPanel.js";
// ...
case "notes":
  return <NotesPanel />;
```

> **Bắt buộc**: thiếu `case` này → panel render `<div>Unknown: notes</div>`.

### 4. `apps/web/src/components/Header.tsx` — menu View

Thêm label vào `PANEL_LABELS`:

```tsx
const PANEL_LABELS: Record<LayoutComponentName, string> = {
  explorer: "Explorer",
  editor: "Editor",
  description: "Description",
  output: "Output",
  notes: "Notes",
};
```

> Menu View tự render từ `ALL_COMPONENTS` — chỉ cần label, không sửa phần JSX.

### 5. (Không cần sửa) `apps/web/src/components/workspace/WorkspaceContext.tsx`

`countTabs()` / `computePanelsVisible()` / `reopenPanel()` duyệt qua `ALL_COMPONENTS` và `defaultTabsetId`/`defaultTabJson` — **tự động nhận** tab mới, không cần đụng.

## Các bước kiểm chứng

```bash
pnpm --filter=@leetcode/layout build && pnpm --filter=@leetcode/layout test
pnpm --filter=@leetcode/web build
```

Thủ công:
1. Mở web → tab mới hiện đúng vị trí default.
2. Đóng tab → menu View hiện nút sáng (click mở lại).
3. Mở lại → tab về đúng vị trí.
4. Ctrl+Z sau khi đóng → tab quay lại.
5. Reload trang → layout persist giữ tab mới.

## Bẫy thường gặp

- **Quên thêm `case` vào factory** → tab render "Unknown".
- **Quên `PANEL_LABELS`** → menu View hiện label lỗi hoặc `undefined`.
- **Type `DefaultTabsetId` không cập nhật** → type error khi return từ `defaultTabsetId`.
- **Tab mới muốn có tabset riêng** → phải thêm vào cả `DefaultTabsetId` lẫn `createDefaultLayout` (cấu trúc `layout.children`).
- **Test `workspace.test.ts`** — nếu thêm tabset mới, cập nhật test đếm tabset (`toHaveLength`).

## Kiến trúc chuẩn — tham khảo

- `packages/layout/src/workspace.ts` — nguồn sự thật cho component names + default layout.
- `apps/web/src/components/workspace/WorkspaceLayout.tsx` — factory (nơi duy nhất map name → React component).
- `apps/web/src/components/workspace/WorkspaceContext.tsx` — state + undo/redo + reopen.
- `apps/web/src/components/Header.tsx` — menu View.
