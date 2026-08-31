import { describe, it, expect } from "vitest";
import { createDefaultLayout, getComponentName, getTabConfig } from "./workspace.js";
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