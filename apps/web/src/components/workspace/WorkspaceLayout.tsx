import { useMemo } from "react";
import { Layout, flexThemeClass, flexCssOverrides } from "@leetcode/layout";
import type { LayoutComponentName } from "@leetcode/layout";
import { useTheme } from "../../lib/theme.js";
import { useWorkspace } from "./WorkspaceContext.js";
import { ExplorerPanel } from "./ExplorerPanel.js";
import { EditorPanel } from "./EditorPanel.js";
import { DescriptionPanel } from "./DescriptionPanel.js";
import { OutputPanel } from "./OutputPanel.js";
import { KnowledgePanel } from "./KnowledgePanel.js";

export function WorkspaceLayout() {
  const { theme } = useTheme();
  const { model, persistModel } = useWorkspace();

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
        case "knowledge":
          return <KnowledgePanel />;
        default:
          return <div>Unknown: {name}</div>;
      }
    };
  }, []);

  const themeClass = flexThemeClass(theme);
  const cssOverrides = useMemo(() => flexCssOverrides(theme), [theme]);

  return (
    <div className={`flexlayout__theme ${themeClass}`} style={{ ...cssOverrides, position: "relative", height: "100%", width: "100%" }}>
      <Layout model={model} factory={factory} onModelChange={persistModel} />
    </div>
  );
}