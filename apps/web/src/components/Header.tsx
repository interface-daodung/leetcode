import { useTheme } from "../lib/theme.js";

export function Header({ sidebarOpen, onToggleSidebar }: { sidebarOpen: boolean; onToggleSidebar: () => void }) {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-header-bg px-3 backdrop-blur-md">
      <button
        type="button"
        onClick={onToggleSidebar}
        title={sidebarOpen ? "Ẩn sidebar" : "Hiện sidebar"}
        className="flex items-center gap-2 rounded-lg px-1 py-1 no-underline transition-colors hover:bg-bg-hover"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
          LC
        </span>
        <span className="hidden text-sm font-semibold text-text-primary sm:inline">LeetCode Lab</span>
      </button>

      <nav className="flex items-center gap-1 text-sm">
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
        {theme === "light" ? "🌙" : "☀️"}
      </button>
    </header>
  );
}