# Reopen Closed Panels (Menu View + Undo/Redo)

## Mục tiêu

Bổ sung cơ chế mở lại các panel/tab đã đóng trong FlexLayout:

- **Ctrl+Z (Undo)**: tab trở về đúng tabset vị trí cũ (gần nhất)
- **Menu View (Header)**: mở lại panel về vị trí mặc định ban đầu (`createDefaultLayout`)

## Phân tích

### Hiện trạng

- `WorkspaceLayout.tsx` quản lý model bằng `useState` + persist thủ công vào `localStorage` (`lc:layout:json`).
- `createDefaultLayout` không gán id cho tabset → FlexLayout tự sinh id mỗi lần load, không ổn định để tham chiếu.
- Khi đóng tab → model thay đổi, persist ngay, không có undo/redo.
- Header và WorkspaceLayout là siblings trong `App.tsx` → cần nâng state layout lên context để Header đọc/ghi.

### FlexLayout API hỗ trợ

- **`Actions.addTab(json, toNodeId, location, index, select)`** — thêm tab vào tabset bất kỳ.
- **`useUndo(initialModel, options)`** — hook undo/redo sẵn có:
  - `model`, `setModel`, `undo()`, `redo()`, `canUndo`, `canRedo`, `undoCount`, `redoCount`.
  - Mặc định ignore `SET_ACTIVE_TABSET` (không tạo undo step khi chuyển tab focus).
  - Khi đóng tab (`Actions.deleteTab`) → 1 undo step → `undo()` khôi phục đúng vị trí cũ.
- `Layout.addTabToTabSet(tabsetId, json)` — method tiện.

## Thay đổi

### 1. `packages/layout/src/workspace.ts` — id tabset tĩnh + helper

- `createDefaultLayout`: thêm `id` vào mỗi tabset:
  - `tabset-explorer` (trái)
  - `tabset-editor` (phải-trên)
  - `tabset-output` (phải-dưới)
- Export thêm:
  - `defaultTabsetId(component: LayoutComponentName): string` — map component → tabset id.
  - `defaultTabJson(component: LayoutComponentName): IJsonTabNode` — tạo tab JSON cho từng panel.
  - `ALL_COMPONENTS: LayoutComponentName[]` — danh sách 4 panel.

### 2. `apps/web/src/components/workspace/WorkspaceContext.tsx` — thêm layout state

Thêm vào `WorkspaceProvider`:
- `useUndo(loadModel, { ignoreActionTypes: [Actions.SET_ACTIVE_TABSET] })` — quản lý model.
- `model` → dùng `setModel` khi load xong (không reset history).
- `undo`, `redo`, `canUndo`, `canRedo` — expose cho Header.
- `reopenPanel(component: LayoutComponentName)` — kiểm tra model có tab mang component đó chưa; nếu chưa → `Actions.addTab(defaultTabJson(component), defaultTabsetId(component), DockLocation.CENTER, -1, true)`.
- `panelsVisible: Record<LayoutComponentName, boolean>` — tính từ model (kiểm tra mỗi component có ít nhất 1 tab không).

### 3. `apps/web/src/components/workspace/WorkspaceLayout.tsx` — nhận model từ context

- Nhận `model` từ `useWorkspace()` thay vì `useState`.
- `<Layout model={model} factory={factory} onModelChange={persistModel} />`
- `persistModel` vẫn debounce persist vào `localStorage` như cũ.
- Xóa `loadModel` local (chuyển vào context).

### 4. `apps/web/src/components/Header.tsx` — menu View + nút Undo/Redo

- Thêm dropdown **View** giữa logo và link LeetCode:
  - 4 checkbox: Explorer ☑, Editor ☑, Description ☑, Output ☑
  - Click unchecked → gọi `reopenPanel(component)`
  - Click checked → focus tab (không đóng)
- Thêm nút **Undo (↩)** / **Redo (↪)** bên cạnh nút theme (disabled khi `canUndo/canRedo` false).
- Bắt phím tắt:
  - `Ctrl+Z` → `undo()`
  - `Ctrl+Shift+Z` hoặc `Ctrl+Y` → `redo()`
  - Dùng `useEffect` + `keydown` listener.

### 5. Hành vi

- **Ctrl+Z**: `undo()` → tab trở về đúng tabset vị trí gần nhất (FlexLayout ghi nhận trong undo snapshot).
- **Menu View → (chọn panel)**: `reopenPanel` → `Actions.addTab` → tab về tabset mặc định (Explorer trái, Editor/Description phải-trên, Output phải-dưới). Nếu tabset mặc định đã bị xóa → `addTabToNewGroup` fallback tạo tabset mới.

## Rủi ro / lưu ý

- `useUndo` replace model (`Model.fromJson`) → remount component. EditorPanel dùng context code → không mất.
- `Actions.addTab` khi tabset mặc định đã bị xóa (user kéo merge hết) → fallback: `Actions.addTabToNewGroup`.
- Persist không bị ảnh hưởng: undo/redo → model thay đổi → `onModelChange` → persist trạng thái mới.

## File chạm

| File | Thay đổi |
|------|----------|
| `packages/layout/src/workspace.ts` | id tabset tĩnh + `defaultTabsetId` + `defaultTabJson` + `ALL_COMPONENTS` |
| `packages/layout/src/workspace.test.ts` | test id tabset + helper |
| `apps/web/src/components/workspace/WorkspaceContext.tsx` | `useUndo`, `reopenPanel`, `panelsVisible`, expose undo/redo |
| `apps/web/src/components/workspace/WorkspaceLayout.tsx` | nhận model từ context, persist |
| `apps/web/src/components/Header.tsx` | menu View + nút Undo/Redo + Ctrl+Z |
| `apps/web/src/App.tsx` | (có thể không cần — Header đọc context) |

## Kiểm chứng

- `pnpm --filter=@leetcode/layout build && pnpm --filter=@leetcode/layout test`
- `pnpm --filter=@leetcode/web build`
- Mở web: đóng tab → Ctrl+Z → tab về lại vị trí cũ.
- Mở web: đóng tab → View → click panel → tab về vị trí mặc định.
- Layout persist sau undo/redo vẫn hoạt động.