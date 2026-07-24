// Vite configuration for SQL Analyst Academy
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import crypto from "crypto";

function swVersionPlugin(): Plugin {
  return {
    name: "sw-version-plugin",
    closeBundle() {
      const swPath = path.resolve(__dirname, "dist/sw.js");
      if (!fs.existsSync(swPath)) return;

      const distAssetsDir = path.resolve(__dirname, "dist/assets");
      const hash = crypto.createHash("md5");

      if (fs.existsSync(distAssetsDir)) {
        const files = fs.readdirSync(distAssetsDir);
        files.sort().forEach((file) => {
          const content = fs.readFileSync(path.join(distAssetsDir, file));
          hash.update(file).update(content);
        });
      }

      const versionHash = hash.digest("hex").substring(0, 8);
      const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "package.json"), "utf-8"));
      const versionString = `v${pkg.version}-${versionHash}`;

      let swContent = fs.readFileSync(swPath, "utf-8");
      swContent = swContent.replace(/__SW_VERSION__/g, versionString);
      fs.writeFileSync(swPath, swContent, "utf-8");
    }
  };
}

export default defineConfig({
  plugins: [react(), swVersionPlugin()],
  server: {
    port: 5173,
    host: "127.0.0.1"
  },
  preview: {
    port: 4173,
    host: "127.0.0.1"
  },
  build: {
    target: "es2022",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("monaco-editor") || id.includes("@monaco-editor")) return "monaco";
            if (id.includes("sql.js")) return "sqljs";
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
