// Vite configuration for SQL Analyst Academy
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "127.0.0.1"
  },
  preview: {
    port: 4173,
    host: "127.0.0.1"
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("lucide")) return "lucide";
            return "vendor";
          }
          if (id.includes("src/data/")) {
            return "curriculum-data";
          }
        }
      }
    }
  }
});
