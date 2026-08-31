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
      // Ảnh icon dùng chung từ packages/shared/asset/icon
      "@icons": path.resolve(__dirname, "../../packages/shared/asset/icon"),
    },
  },
  server: {
    fs: {
      // Cho phép import ảnh icon nằm ngoài root apps/web (trong monorepo)
      allow: [
        path.resolve(__dirname, "../.."),
      ],
    },
  },
});