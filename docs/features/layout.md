# Layout Package {#layout}

## Giới thiệu {#gioi-thieu}

`packages/layout` wrap **FlexLayout** (`flexlayout-react`) thành package nội bộ để các app dùng chung, giữ **state/tree model** của dockable layout tách khỏi app.

## Thành phần {#thanh-phan}

- `createDefaultLayout(defs?)` — tạo default layout tree kiểu IDE (`row → tabset → tab`): Explorer (trái, weight 25) + cột phải (weight 75: Editor+Description trên, Output dưới).
- `Layout`, `Model`, `Actions`, `DockLocation` — re-export từ `flexlayout-react`.
- `getComponentName(node)` — lấy component name từ TabNode (dùng trong factory).
- `getTabConfig<T>(node)` — đọc config đính kèm tab.
- `flexThemeClass(theme)` — class FlexLayout theme (`flexlayout__theme_alpha_light/dark`).
- `flexCssOverrides(theme)` — CSS variables overrides đồng bộ với CSS variables của web.

## Types {#types}

- `LayoutComponentName` — `"explorer" | "editor" | "description" | "output"`.
- `LayoutTabDefinition` — `{ id?, name, component, config? }`.

## Dependency {#dependency}

```text
@leetcode/layout ──> @leetcode/shared, react, react-dom, flexlayout-react
```

## Ghi chú {#ghi-chu}

- ESM-only (FlexLayout), web dùng `moduleResolution: bundler`; server không import package này.
- `<Layout>` phải nằm trong container có `position: relative` + `height: 100%`.
