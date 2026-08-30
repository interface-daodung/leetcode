import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@leetcode/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@leetcode/editor": path.resolve(__dirname, "../../packages/editor/src"),
      "@leetcode/problem-engine": path.resolve(__dirname, "../../packages/problem-engine/src"),
    },
  },
});