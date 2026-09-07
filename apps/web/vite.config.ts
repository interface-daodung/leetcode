import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "/",
  // Đọc .env từ root monorepo để dùng chung VITE_API_URL / API_URL (theo yêu cầu host lưu ở .env)
  envDir: path.resolve(__dirname, "../../"),
  build: {
    assetsDir: "static",
    rollupOptions: {
      output: {
        entryFileNames: "static/[name]-[hash].js",
        chunkFileNames: "static/[name]-[hash].js",
        assetFileNames: "static/[name]-[hash][extname]",
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@leetcode/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@leetcode/ai": path.resolve(__dirname, "../../packages/ai/src"),
    },
  },
});