# Layout {#layout}

## Tổng quan

`packages/layout` — Wrap **FlexLayout** (`flexlayout-react`) thành package nội bộ để các app dùng chung, giữ **state/tree model** của dockable layout tách khỏi app.

- Dùng bởi `apps/web` (chính)
- Server **không** import package này

## Thành phần Chính

| Export | Mô tả |
|--------|-------|
| `createDefaultLayout(defs?)` | Tạo default layout tree kiểu IDE (`row → tabset → tab`) |
| `Layout`, `Model`, `Actions`, `DockLocation` | Re-export từ `flexlayout-react` |
| `getComponentName(node)` | Lấy component name từ TabNode (dùng trong factory) |
| `getTabConfig<T>(node)` | Đọc config đính kèm tab |
| `flexThemeClass(theme)` | Class FlexLayout theme (`flexlayout__theme_alpha_light/dark`) |
| `flexCssOverrides(theme)` | CSS variables overrides đồng bộ với CSS variables của web |

## Default Layout Tree

```
Row (root)
  ├─ TabSet (left, weight 25) → Tab "explorer" (ExplorerPanel)
  └─ TabSet (right, weight 75)
       ├─ TabSet (top, weight 60)
       │    ├─ Tab "editor" (EditorPanel)
       │    └─ Tab "description" (DescriptionPanel)
       └─ TabSet (bottom, weight 40) → Tab "output" (OutputPanel)
```

## Types

```typescript
type LayoutComponentName = "explorer" | "editor" | "description" | "output";

interface LayoutTabDefinition {
  id?: string;
  name: string;
  component: LayoutComponentName;
  config?: Record<string, unknown>;
}
```

## Usage trong Web

```tsx
// apps/web/src/layout/WorkspaceLayout.tsx
import { Layout, createDefaultLayout, flexThemeClass, flexCssOverrides } from "@leetcode/layout";

<Layout
  model={model}
  onModelChange={setModel}
  className={flexThemeClass(theme)}
  style={flexCssOverrides(theme)}
>
  {({ tab, tabSet, border, splitter }) => (
    // Tab factory mapping component name → React component
  )}
</Layout>
```

- `<Layout>` phải nằm trong container có `position: relative` + `height: 100%`
- Web dùng `WorkspaceProvider` quản lý model state + persist `localStorage` (`lc:layout:json`)

## Theme Sync

- Web CSS variables: `:root` (light) + `[data-theme="dark"]` (dark)
- `flexThemeClass(theme)` → `flexlayout__theme_alpha_light` / `flexlayout__theme_alpha_dark`
- `flexCssOverrides(theme)` → CSS var overrides (border color, background, text color)

## Persist & Restore

- Model JSON serialize → `localStorage.setItem("lc:layout:json", JSON.stringify(model))`
- Khởi động: `migrateLayoutJson` trong `WorkspaceContext` tự đổi tab `knowledge` cũ → `knowledge-search` + chèn tabset result

## Dependency

```
@leetcode/layout ──▶ @leetcode/shared, react, react-dom, flexlayout-react
```

- ESM-only (FlexLayout)
- Web dùng `moduleResolution: bundler` (Vite)
- Server không import

## Build & Test

```bash
pnpm --filter=@leetcode/layout build   # tsc --noEmit (type-check)
pnpm --filter=@leetcode/layout test    # Vitest (10 tests)
pnpm --filter=@leetcode/layout lint    # ESLint
```

## Ghi chú

- Trước đây là `packages/layout` riêng, sau gộp vào `apps/web/src/layout/` (2026-09-04 cleanup)
- Hiện tại package này là wrap FlexLayout chung nếu có app khác cần
- `LayoutComponentName` mở rộng khi thêm panel mới (vd `ai`, `error`, `knowledge-search`, `knowledge-result`)