import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api/soarca": {
        target: process.env.VITE_SOARCA_DEV_TARGET ?? "http://localhost:8080",
        rewrite: (path) => path.replace(/^\/api\/soarca/, ""),
        changeOrigin: true
      }
    }
  },
  preview: {
    host: true,
    port: 4173
  }
});
