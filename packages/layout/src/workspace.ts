import type { IJsonModel, IJsonTabNode, TabNode } from "flexlayout-react";

/**
 * Tên component được đăng ký trong FlexLayout factory.
 * App (web) map tên này → React component panel tương ứng.
 */
export type LayoutComponentName =
  | "explorer"
  | "editor"
  | "description"
  | "output"
  | "knowledge-search"
  | "knowledge-result";

/** Danh sách đầy đủ các panel trong workspace. */
export const ALL_COMPONENTS: LayoutComponentName[] = [
  "explorer",
  "editor",
  "description",
  "output",
  "knowledge-search",
  "knowledge-result",
];

/** Id cố định của tabset mặc định chứa từng panel (dùng để mở lại panel về vị trí ban đầu). */
export type DefaultTabsetId = "tabset-explorer" | "tabset-editor" | "tabset-output" | "tabset-knowledge-search" | "tabset-knowledge-result";

export interface LayoutTabDefinition {
  id?: string;
  name: string;
  component: LayoutComponentName;
  config?: Record<string, unknown>;
}

/** Map component → tabset mặc định chứa panel đó. */
export function defaultTabsetId(component: LayoutComponentName): DefaultTabsetId {
  switch (component) {
    case "explorer":
      return "tabset-explorer";
    case "editor":
    case "description":
      return "tabset-editor";
    case "output":
    case "knowledge-search":
      return "tabset-output";
    case "knowledge-result":
      return "tabset-knowledge-result";
  }
}

/** Tạo JSON tab cho một panel (dùng khi mở lại panel qua menu View). */
export function defaultTabJson(component: LayoutComponentName): IJsonTabNode {
  return { type: "tab", name: defaultName(component), component };
}

/**
 * Tạo default layout tree (row → tabset → tab) kiểu IDE:
 * - Explorer (trái, weight 25)
 * - Cột phải (weight 75): Editor + Description (trên), Output + Knowledge-Search (dưới)
 * - Cột giữa dưới: Knowledge-Result (tabset riêng, weight 30)
 */
export function createDefaultLayout(defs: LayoutTabDefinition[] = []): IJsonModel {
  const tabs = (component: LayoutComponentName, defs?: LayoutTabDefinition[]): LayoutTabDefinition[] =>
    defs && defs.length > 0 ? defs.filter((d) => d.component === component) : [{ name: defaultName(component), component }];

  const explorer = tabs("explorer", defs);
  const editor = tabs("editor", defs);
  const description = tabs("description", defs);
  const output = tabs("output", defs);
  const knowledgeSearch = tabs("knowledge-search", defs);
  const knowledgeResult = tabs("knowledge-result", defs);

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
          id: "tabset-explorer",
          weight: 25,
          children: explorer.map(toJsonTab),
        },
        {
          type: "row",
          weight: 75,
          children: [
            {
              type: "tabset",
              id: "tabset-editor",
              weight: 70,
              children: [...editor.map(toJsonTab), ...description.map(toJsonTab)],
            },
            {
              type: "row",
              weight: 30,
              children: [
                {
                  type: "tabset",
                  id: "tabset-output",
                  weight: 50,
                  children: [...output.map(toJsonTab), ...knowledgeSearch.map(toJsonTab)],
                },
                {
                  type: "tabset",
                  id: "tabset-knowledge-result",
                  weight: 50,
                  children: knowledgeResult.map(toJsonTab),
                },
              ],
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
    case "knowledge-search":
      return "Knowledge Search";
    case "knowledge-result":
      return "Knowledge Result";
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
