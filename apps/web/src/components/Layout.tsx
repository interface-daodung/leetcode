import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header.js";
import { Sidebar } from "./Sidebar.js";
import { applyFavicon } from "../appIcon.js";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    applyFavicon();
  }, []);

  return (
    <div className="flex h-full flex-col">
      <Header sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      <div className="flex min-h-0 flex-1">
        <aside
          className={`shrink-0 overflow-hidden border-r border-border bg-sidebar-bg transition-all duration-200 ${
            sidebarOpen ? "w-64 md:w-72 lg:w-80" : "w-0"
          }`}
        >
          <div className={`h-full ${sidebarOpen ? "" : "hidden"}`}>
            <Sidebar />
          </div>
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto bg-bg-primary">
          <Outlet />
        </main>
      </div>
    </div>
  );
}