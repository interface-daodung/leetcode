import { Link } from "react-router-dom";
import { useTheme } from "../lib/theme.js";

export function Header() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-header-bg px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 font-semibold text-text-primary no-underline">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            LC
          </span>
          <span className="hidden text-sm sm:inline">LeetCode Lab</span>
        </Link>
      </div>

      <nav className="flex items-center gap-1 text-sm">
        <Link
          to="/problems"
          className="rounded-lg px-3 py-1.5 font-medium text-text-secondary no-underline transition-colors hover:bg-bg-hover hover:text-text-primary"
        >
          Problems
        </Link>
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