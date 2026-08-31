import type { IJsonModel, TabNode } from "flexlayout-react";

/**
 * Tên component được đăng ký trong FlexLayout factory.
 * App (web) map tên này → React component panel tương ứng.
 */
export type LayoutComponentName = "explorer" | "editor" | "description" | "output";

export interface LayoutTabDefinition {
  id?: string;
  name: string;
  component: LayoutComponentName;
  config?: Record<string, unknown>;
}

/**
 * Tạo default layout tree (row → tabset → tab) kiểu IDE:
 * - Explorer (trái, weight 25)
 * - Cột phải (weight 75): Editor + Description (trên), Output (dưới)
 */
export function createDefaultLayout(defs: LayoutTabDefinition[] = []): IJsonModel {
  const tabs = (component: LayoutComponentName, defs?: LayoutTabDefinition[]): LayoutTabDefinition[] =>
    defs && defs.length > 0 ? defs.filter((d) => d.component === component) : [{ name: defaultName(component), component }];

  const explorer = tabs("explorer", defs);
  const editor = tabs("editor", defs);
  const description = tabs("description", defs);
  const output = tabs("output", defs);

  return {
    global: {
      tabSetEnableTabStrip: true,
      tabEnablePopout: false,
    },
    borders: [],
    layout: {
      type: "row",
      weight: 100,
      children: [
        {
          type: "tabset",
          weight: 25,
          children: explorer.map(toJsonTab),
        },
        {
          type: "row",
          weight: 75,
          children: [
            {
              type: "tabset",
              weight: 70,
              children: [...editor.map(toJsonTab), ...description.map(toJsonTab)],
            },
            {
              type: "tabset",
              weight: 30,
              children: output.map(toJsonTab),
            },
          ],
        },
      ],
    },
  };
}

function defaultName(component: LayoutComponentName): string {
  switch (component) {
    case "explorer":
      return "Explorer";
    case "editor":
      return "Editor";
    case "description":
      return "Description";
    case "output":
      return "Output";
  }
}

function toJsonTab(def: LayoutTabDefinition): { type: "tab"; id?: string; name: string; component: LayoutComponentName; config?: Record<string, unknown> } {
  return { type: "tab", ...(def.id ? { id: def.id } : {}), name: def.name, component: def.component, ...(def.config ? { config: def.config } : {}) };
}

/** Lấy component name từ node (dùng trong factory của web). */
export function getComponentName(node: TabNode): LayoutComponentName {
  return node.getComponent() as LayoutComponentName;
}

/** Đọc config đính kèm tab (vd problemId, slug...). */
export function getTabConfig<T>(node: TabNode): T | undefined {
  return node.getConfig() as T | undefined;
}
