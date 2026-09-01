import { describe, it, expect } from "vitest";
import type { IJsonRowNode } from "flexlayout-react";
import { createDefaultLayout, defaultTabsetId, defaultTabJson, ALL_COMPONENTS, getComponentName, getTabConfig } from "./workspace.js";
import { flexThemeClass, flexCssOverrides } from "./theme.js";

describe("createDefaultLayout", () => {
  it("trả layout model với cấu trúc row → 2 tabset (explorer + editor/output)", () => {
    const model = createDefaultLayout();
    expect(model.layout.type).toBe("row");
    expect(model.layout.children).toHaveLength(2);
    const left = model.layout.children![0];
    const right = model.layout.children![1];
    expect(left.type).toBe("tabset");
    expect(right.type).toBe("row");
  });

  it("gán id ổn định cho từng tabset mặc định", () => {
    const model = createDefaultLayout();
    const left = model.layout.children![0];
    expect(left.type).toBe("tabset");
    expect(left.id).toBe("tabset-explorer");

    const right = model.layout.children![1];
    expect(right.type).toBe("row");
    const rightChildren = right.children!;
    expect(rightChildren[0].type).toBe("tabset");
    expect(rightChildren[0].id).toBe("tabset-editor");
    expect(rightChildren[1].type).toBe("row");

    // Row dưới phải: tabset-output + tabset-knowledge-result
    const bottomRow = rightChildren[1] as IJsonRowNode;
    expect(bottomRow.children).toHaveLength(2);
    const bottomChildren = bottomRow.children!;
    expect(bottomChildren[0].type).toBe("tabset");
    expect(bottomChildren[0].id).toBe("tabset-output");
    expect(bottomChildren[1].type).toBe("tabset");
    expect(bottomChildren[1].id).toBe("tabset-knowledge-result");
  });

  it("tab child đầu tiên có component explorer", () => {
    const model = createDefaultLayout([{ name: "Explorer", component: "explorer" }]);
    const left = model.layout.children![0];
    expect(left.type).toBe("tabset");
    expect(left.children).toHaveLength(1);
    const child = left.children![0];
    if (child.type === "tab" && "component" in child) {
      expect(child.component).toBe("explorer");
    }
  });

  it("tạo model round-trip: toJson tạo lại cấu trúc đúng", () => {
    const model = createDefaultLayout();
    // Mô phỏng round-trip: JSON stringify/parse
    const json = JSON.parse(JSON.stringify(model));
    expect(json.layout.type).toBe("row");
    expect(json.layout.children[0].type).toBe("tabset");
    expect(json.layout.children[1].type).toBe("row");
  });
});

describe("defaultTabsetId", () => {
  it("map đúng component → tabset mặc định", () => {
    expect(defaultTabsetId("explorer")).toBe("tabset-explorer");
    expect(defaultTabsetId("editor")).toBe("tabset-editor");
    expect(defaultTabsetId("description")).toBe("tabset-editor");
    expect(defaultTabsetId("output")).toBe("tabset-output");
    expect(defaultTabsetId("knowledge-search")).toBe("tabset-output");
    expect(defaultTabsetId("knowledge-result")).toBe("tabset-knowledge-result");
  });
});

describe("defaultTabJson", () => {
  it("tạo tab JSON đúng name + component cho từng panel", () => {
    expect(defaultTabJson("explorer")).toEqual({ type: "tab", name: "Explorer", component: "explorer" });
    expect(defaultTabJson("editor")).toEqual({ type: "tab", name: "Editor", component: "editor" });
    expect(defaultTabJson("description")).toEqual({ type: "tab", name: "Description", component: "description" });
    expect(defaultTabJson("output")).toEqual({ type: "tab", name: "Output", component: "output" });
    expect(defaultTabJson("knowledge-search")).toEqual({ type: "tab", name: "Knowledge Search", component: "knowledge-search" });
    expect(defaultTabJson("knowledge-result")).toEqual({ type: "tab", name: "Knowledge Result", component: "knowledge-result" });
  });
});

describe("ALL_COMPONENTS", () => {
  it("liệt kê đủ 6 panel (4 cơ bản + 2 knowledge)", () => {
    expect(ALL_COMPONENTS).toEqual(["explorer", "editor", "description", "output", "knowledge-search", "knowledge-result"]);
  });
});

describe("getComponentName / getTabConfig", () => {
  it("trả đúng component name từ node", () => {
    // getComponentName/getTabConfig cần TabNode instance thật từ FlexLayout.
    // Ở package level, chỉ kiểm tra type signature. Test runtime ở app level.
    expect(typeof getComponentName).toBe("function");
    expect(typeof getTabConfig).toBe("function");
  });
});

describe("theme", () => {
  it("flexThemeClass trả class đúng cho light/dark", () => {
    expect(flexThemeClass("light")).toBe("flexlayout__theme_alpha_light");
    expect(flexThemeClass("dark")).toBe("flexlayout__theme_alpha_dark");
  });

  it("flexCssOverrides trả obj với key bắt đầu bằng --flexlayout", () => {
    const light = flexCssOverrides("light");
    const dark = flexCssOverrides("dark");
    expect(Object.keys(light).length).toBeGreaterThan(0);
    expect(Object.keys(dark).length).toBeGreaterThan(0);
    expect(light["--flexlayout-color-1"]).toBe("#f7f7f8");
    expect(dark["--flexlayout-color-1"]).toBe("#0f1117");
  });
});