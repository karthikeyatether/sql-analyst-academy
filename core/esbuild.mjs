import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function copyIncremental(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyIncremental(path.join(src, item), path.join(dest, item));
    }
  } else {
    if (!fs.existsSync(dest) || fs.statSync(dest).mtimeMs < stats.mtimeMs) {
      fs.copyFileSync(src, dest);
    }
  }
}

async function build() {
  const distDir = path.resolve(__dirname, "dist");
  const assetsDir = path.join(distDir, "assets");
  const workersDir = path.join(distDir, "workers");

  // 1. Clean build output directories (without wiping static public assets)
  if (fs.existsSync(assetsDir)) fs.rmSync(assetsDir, { recursive: true, force: true });
  if (fs.existsSync(workersDir)) fs.rmSync(workersDir, { recursive: true, force: true });
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.mkdirSync(workersDir, { recursive: true });

  // 2. Run esbuild
  const startTime = Date.now();
  console.log("esbuild compiling...");
  
  await Promise.all([
    esbuild.build({
      entryPoints: ["src/main.tsx"],
      bundle: true,
      external: ["monaco-editor"],
      minify: false,
      format: "esm",
      target: "esnext",
      jsx: "automatic",
      outdir: assetsDir,
      define: {
        "process.env.NODE_ENV": '"development"',
        "import.meta.env.PROD": "false",
        "import.meta.env.DEV": "true",
        "import.meta.env.VITE_BUILD_TOOL": '"esbuild"',
        "import.meta.env": "{}"
      },
      loader: {
        ".ttf": "file",
        ".woff": "file",
        ".woff2": "file",
        ".eot": "file",
        ".wasm": "file",
        ".svg": "file",
        ".png": "file",
        ".jpg": "file",
        ".jpeg": "file",
        ".gif": "file",
        ".mp4": "file",
        ".webm": "file"
      },
    }),
    esbuild.build({
      entryPoints: ["src/workers/sqlWorker.ts"],
      bundle: true,
      minify: false,
      format: "iife",
      target: "esnext",
      outfile: path.join(distDir, "workers", "sqlWorker.js"),
      define: {
        "process.env.NODE_ENV": '"development"',
        "import.meta.env.PROD": "false",
        "import.meta.env.DEV": "true",
        "import.meta.env.VITE_BUILD_TOOL": '"esbuild"',
        "import.meta.env": "{}"
      },
      loader: {
        ".wasm": "file"
      }
    })
  ]);

  const buildTime = Date.now() - startTime;

  // 3. Copy public files incrementally (skip unchanged Monaco editor & WASM assets)
  const publicDir = path.resolve(__dirname, "public");
  if (fs.existsSync(publicDir)) {
    copyIncremental(publicDir, distDir);
  }

  const serviceWorkerPath = path.join(distDir, "sw.js");
  if (fs.existsSync(serviceWorkerPath)) {
    const serviceWorker = fs.readFileSync(serviceWorkerPath, "utf-8");
    fs.writeFileSync(
      serviceWorkerPath,
      serviceWorker.replace("__SW_VERSION__", `esbuild-${Date.now()}`),
      "utf-8",
    );
  }

  // 4. Generate index.html
  let html = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
  
  // Inject script and css
  html = html.replace(
    '</head>',
    `  <link rel="stylesheet" href="/assets/main.css">\n</head>`
  ).replace(
    '</body>',
    `  <script type="module" src="/assets/main.js"></script>\n</body>`
  );
  
  // Strip Vite's module script
  html = html.replace(/<script type="module" src="\/src\/main\.tsx"><\/script>/, "");

  fs.writeFileSync(path.join(distDir, "index.html"), html, "utf-8");

  console.log(`\n? esbuild finished in ${buildTime}ms!`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
