import { useMemo, useRef, useState } from "react";
import { Layout, Model, createDefaultLayout, flexThemeClass, flexCssOverrides } from "@leetcode/layout";
import type { IJsonModel } from "@leetcode/layout";
import { useTheme } from "../../lib/theme.js";
import { ExplorerPanel } from "./ExplorerPanel.js";
import { EditorPanel } from "./EditorPanel.js";
import { DescriptionPanel } from "./DescriptionPanel.js";
import { OutputPanel } from "./OutputPanel.js";
import type { LayoutComponentName } from "@leetcode/layout";

const STORAGE_KEY = "lc:layout:json";

function loadModel(): Model {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return Model.fromJson(JSON.parse(raw) as IJsonModel);
    }
  } catch {
    // bỏ qua, dùng default
  }
  return Model.fromJson(createDefaultLayout());
}

export function WorkspaceLayout() {
  const { theme } = useTheme();
  const [model] = useState<Model>(() => loadModel());
  const persistTimer = useRef<number | null>(null);

  const factory = useMemo(() => {
    return (node: Parameters<NonNullable<Parameters<typeof Layout>[0]["factory"]>>[0]) => {
      const name = node.getComponent() as LayoutComponentName;
      switch (name) {
        case "explorer":
          return <ExplorerPanel />;
        case "editor":
          return <EditorPanel />;
        case "description":
          return <DescriptionPanel />;
        case "output":
          return <OutputPanel />;
        default:
          return <div>Unknown: {name}</div>;
      }
    };
  }, []);

  // Khi model thay đổi (kéo thả tab, resize...) → persist vào localStorage (debounce).
  const handleModelChange = (m: Model) => {
    if (persistTimer.current !== null) {
      window.clearTimeout(persistTimer.current);
    }
    persistTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(m.toJson()));
      } catch {
        // storage đầy / private mode → bỏ qua
      }
    }, 500);
  };

  const themeClass = flexThemeClass(theme);
  const cssOverrides = useMemo(() => flexCssOverrides(theme), [theme]);

  return (
    <div className={`flexlayout__theme ${themeClass}`} style={{ ...cssOverrides, position: "relative", height: "100%", width: "100%" }}>
      <Layout model={model} factory={factory} onModelChange={handleModelChange} />
    </div>
  );
}