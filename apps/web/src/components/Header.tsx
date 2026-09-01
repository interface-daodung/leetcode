import { useEffect, useRef, useState } from "react";
import { useTheme } from "../lib/theme.js";
import { useWorkspace } from "./workspace/WorkspaceContext.js";
import { ALL_COMPONENTS } from "@leetcode/layout";
import type { LayoutComponentName } from "@leetcode/layout";

const PANEL_LABELS: Record<LayoutComponentName, string> = {
  explorer: "Explorer",
  editor: "Editor",
  description: "Description",
  output: "Output",
};

export function Header() {
  const { theme, toggle } = useTheme();
  const { undo, redo, canUndo, canRedo, panelsVisible, reopenPanel } = useWorkspace();
  const [viewOpen, setViewOpen] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);

  // Đóng menu View khi click ngoài
  useEffect(() => {
    if (!viewOpen) return;
    const handler = (e: MouseEvent) => {
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) {
        setViewOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [viewOpen]);

  // Phím tắt Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const handleViewItem = (component: LayoutComponentName) => {
    reopenPanel(component);
    setViewOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-header-bg px-3 backdrop-blur-md">
      <div className="flex items-center gap-2 rounded-lg px-1 py-1">
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-accent">
          <img src="/assets/leetcodeLab.webp" alt="LeetCode Lab" className="h-full w-full object-cover" />
        </span>
        <span className="hidden text-sm font-semibold text-text-primary sm:inline">LeetCode Lab</span>
      </div>

      {/* Menu View */}
      <div className="relative" ref={viewRef}>
        <button
          type="button"
          onClick={() => setViewOpen((v) => !v)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
        >
          View
        </button>
        {viewOpen && (
          <div className="absolute left-0 top-full mt-1 w-44 rounded-lg border border-border bg-bg-elevated py-1 shadow-lg">
            {ALL_COMPONENTS.map((comp) => {
              const visible = panelsVisible[comp];
              return (
                <button
                  key={comp}
                  type="button"
                  disabled={visible}
                  onClick={() => handleViewItem(comp)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors disabled:cursor-default enabled:hover:bg-bg-hover"
                >
                  <span className={visible ? "text-text-muted" : "text-text-primary"}>
                    {PANEL_LABELS[comp]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <nav className="flex items-center gap-1 text-sm">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-30"
        >
          <i className="fa-solid fa-rotate-left" />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-30"
        >
          <i className="fa-solid fa-rotate-right" />
        </button>

        <a
          href="https://leetcode.com/problems"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg px-3 py-1.5 font-medium text-text-secondary no-underline transition-colors hover:bg-bg-hover hover:text-text-primary"
        >
          LeetCode ↗
        </a>
      </nav>

      <button
        type="button"
        onClick={toggle}
        aria-label="Đổi theme"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
      >
        {theme === "light" ? <i className="fa-regular fa-moon" /> : <i className="fa-solid fa-sun" />}
      </button>
    </header>
  );
}