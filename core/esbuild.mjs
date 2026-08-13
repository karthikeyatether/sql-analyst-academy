import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
  const distDir = path.resolve(__dirname, "dist");
  const assetsDir = path.join(distDir, "assets");

  // 1. Clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(assetsDir, { recursive: true });

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

  // 3. Copy public files (Optimized using native cpSync)
  const publicDir = path.resolve(__dirname, "public");
  if (fs.existsSync(publicDir)) {
    fs.cpSync(publicDir, distDir, { recursive: true });
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

  console.log(`\n⚡ esbuild finished in ${buildTime}ms!`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
