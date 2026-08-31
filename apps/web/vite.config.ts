import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  // Đọc .env từ root monorepo để dùng chung VITE_API_URL / API_URL (theo yêu cầu host lưu ở .env)
  envDir: path.resolve(__dirname, "../../"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@leetcode/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@leetcode/editor": path.resolve(__dirname, "../../packages/editor/src"),
      "@leetcode/problem-engine": path.resolve(__dirname, "../../packages/problem-engine/src"),
      "@leetcode/layout": path.resolve(__dirname, "../../packages/layout/src"),
    },
  },
});