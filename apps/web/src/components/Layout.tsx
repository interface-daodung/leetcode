import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header.js";
import { Sidebar } from "./Sidebar.js";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex min-h-0 flex-1">
        <div className="hidden md:block md:w-72 lg:w-80">
          <Sidebar />
        </div>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72">
              <Sidebar />
            </div>
          </div>
        )}
        <main className="min-w-0 flex-1 overflow-y-auto bg-bg-primary">
          <Outlet />
        </main>
      </div>
      <button
        type="button"
        onClick={() => setSidebarOpen((o) => !o)}
        className="fixed bottom-5 left-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-lg text-white shadow-lg md:hidden"
        aria-label="Mở danh sách đề bài"
      >
        ☰
      </button>
    </div>
  );
}