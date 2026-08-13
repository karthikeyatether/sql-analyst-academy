import { defineConfig, Plugin } from "vite";
import preact from "@preact/preset-vite";
import fs from "fs";
import path from "path";
import crypto from "crypto";

import { VitePWA } from "vite-plugin-pwa";

// Monaco is served from public/vs/ (pre-built AMD files) in ALL modes.
// Rollup never bundles Monaco — this saves ~8s of build time.
const isMonacoExternal = (id: string) =>
  id === "monaco-editor" || id.startsWith("monaco-editor/");

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      preact(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "favicon.png", "app_icon.ico", "icon-192.png", "icon-512.png", "sql-wasm.wasm", "vs/**/*"],
        manifest: {
          name: "SQL Analyst Academy",
          short_name: "SQL Academy",
          description: "Offline-first SQL learning platform with interactive analytics challenges.",
          theme_color: "#05080c",
          background_color: "#05080c",
          display: "standalone",
          icons: [
            { src: "icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "icon-512.png", sizes: "512x512", type: "image/png" }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 15000000,
          globPatterns: ["**/*.{js,css,html,ico,png,svg,wasm}"]
        }
      })
    ],
    worker: {
      format: "iife",
    },
    server: {
      port: 5173,
      host: "127.0.0.1",
    },
    preview: {
      port: 4173,
      host: "127.0.0.1",
    },
    esbuild: {
      legalComments: "none",
      treeShaking: true,
    },
    build: {
      target: "esnext",
      minify: isDev ? false : "esbuild",
      cssCodeSplit: isDev ? false : true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 4500,
      modulePreload: isDev
        ? false
        : {
            polyfill: false,
            resolveDependencies: (_filename, dependencies) =>
              dependencies.filter(
                (dependency) =>
                  !dependency.includes("monaco") &&
                  !dependency.includes("problems-") &&
                  !dependency.includes("curriculum-") &&
                  !dependency.includes("puzzles-") &&
                  !dependency.includes("datasets-") &&
                  !dependency.includes("sqljs") &&
                  !dependency.includes("sqlEngine"),
              ),
          },
      rollupOptions: {
        treeshake: isDev ? false : "recommended",
        // Monaco is always external — served from /vs (public/vs/) via AMD loader
        external: isDev
          ? (id: string) =>
              isMonacoExternal(id) || id === "lucide-react"
          : isMonacoExternal,
        output: {
          globals: isDev
            ? {
                "monaco-editor": "monaco",
                "@monaco-editor/react": "MonacoEditor",
                "lucide-react": "LucideReact",
              }
            : {
                "monaco-editor": "monaco",
                "@monaco-editor/react": "MonacoEditor",
              },
          manualChunks: isDev
            ? undefined
            : (id) => {
                if (id.includes("node_modules")) {
                  if (id.includes("sql.js")) return "sqljs";
                  if (id.includes("lucide")) return "lucide";
                  if (id.includes("react") || id.includes("scheduler"))
                    return "react-vendor";
                  return "vendor";
                }
                if (
                  id.includes("src/utils/sqlLinter") ||
                  id.includes("src/utils/sqlErrorTranslator") ||
                  id.includes("src/utils/graderService") ||
                  id.includes("src/utils/monacoConfig")
                )
                  return "sql-services";
                if (id.includes("src/data/problems_batch1"))
                  return "problems-batch1";
                if (id.includes("src/data/problems_batch2"))
                  return "problems-batch2";
                if (id.includes("src/data/problems_batch3"))
                  return "problems-batch3";
                if (id.includes("src/data/puzzles")) return "puzzles-data";
                if (id.includes("src/data/datasets")) return "datasets-data";
                if (id.includes("src/data/")) return "curriculum-core";
              },
        },
      },
    },
  };
});
